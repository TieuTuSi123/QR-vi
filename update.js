// update.js
import * as Constants from './constants.js';
import { Logger, LogCategory } from './logger.js';
// Import hàm công cụ cốt lõi của SillyTavern để tạo tiêu đề yêu cầu hợp lệ (bao gồm CSRF Token)
import { getRequestHeaders } from '../../../../script.js';
import { translate } from '../../../i18n.js';

// Cấu hình kho lưu trữ từ xa
const REPO_ROOT = "https://raw.githubusercontent.com/TieuTuSi123/QR-vi/main";
const MANIFEST_URL = `${REPO_ROOT}/manifest.json`;
const CHANGELOG_URL = `${REPO_ROOT}/CHANGELOG.md`;

const KEY_LAST_CHECK = `${Constants.EXTENSION_NAME}_last_update_check`;
const KEY_UPDATE_INFO = `${Constants.EXTENSION_NAME}_update_info`;

/**
 * Lấy phiên bản tiện ích cục bộ không đồng bộ (tối ưu hóa cho display_name và đường dẫn third-party)
 */
async function getLocalVersion() {
    try {
        // 1. Gọi API backend để khám phá tất cả tiện ích
        // ext.name trả về thực chất là đường dẫn, ví dụ "third-party/QR"
        const discoverResponse = await fetch('/api/extensions/discover');
        if (!discoverResponse.ok) return "Error (API)";
        
        const installedExtensions = await discoverResponse.json(); 

        // 2. Đọc đồng thời các tệp manifest
        const manifestPromises = installedExtensions.map(async (ext) => {
            try {
                // Lưu ý: fetch ở đây cần dùng ext.name (tức là đường dẫn đầy đủ)
                const res = await fetch(`/scripts/extensions/${ext.name}/manifest.json`);
                if (res.ok) {
                    const json = await res.json();
                    return {
                        manifest: json,
                        folderPath: ext.name // Lưu "third-party/QR"
                    };
                }
            } catch (e) {}
            return null;
        });

        const results = await Promise.all(manifestPromises);
        const validResults = results.filter(r => r !== null);

        // 3. Logic khớp
        const target = validResults.find(item => {
            const m = item.manifest;
            const folder = item.folderPath;
            
            if (m.display_name === "QR Assistant") return true;

            // Chỉ cần đường dẫn kết thúc bằng /QR, hoặc chính là QR
            if (folder === "QR" || folder.endsWith("/QR") || folder.endsWith("/qr-assistant")) {
                return true;
            }

            return false;
        });

        if (target) {
            Logger.info(LogCategory.UPDATE, `Phát hiện tiện ích cục bộ: ${target.folderPath}, phiên bản: ${target.manifest.version}`);
            return target.manifest.version || "No Version";
        }

        return "Unknown";

    } catch (error) {
        Logger.error(LogCategory.UPDATE, 'Kiểm tra phiên bản cục bộ thất bại', error);
        return "Error";
    }
}

function compareVersions(v1, v2) {
    if (!v1 || !v2) return 0;
    const p1 = v1.replace(/^v/, '').split('.').map(Number);
    const p2 = v2.replace(/^v/, '').split('.').map(Number);
    const len = Math.max(p1.length, p2.length);
    for (let i = 0; i < len; i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}

async function getRemoteVersion() {
    try {
        const response = await fetch(MANIFEST_URL + `?t=${Date.now()}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.version;
    } catch (error) {
        return null;
    }
}

export async function checkForUpdates(force = false) {
    const now = Date.now();
    const lastCheck = localStorage.getItem(KEY_LAST_CHECK);
    
    // 1. Lấy phiên bản cục bộ theo thời gian thực mỗi lần
    // Mức tiêu tốn cho việc này rất nhỏ vì nó chỉ đọc tệp cục bộ
    const localVer = await getLocalVersion();
    
    let remoteVer = null;
    let usedCache = false;

    // 2. Cố gắng lấy phiên bản từ xa
    // Nếu không phải làm mới bắt buộc và bộ nhớ cache chưa hết hạn (24h), hãy thử trích xuất số phiên bản từ xa từ bộ nhớ cache
    if (!force && lastCheck && (now - parseInt(lastCheck) < 86400000)) {
        const cachedStr = localStorage.getItem(KEY_UPDATE_INFO);
        if (cachedStr) {
            try {
                const cachedObj = JSON.parse(cachedStr);
                // Chúng ta chỉ tin tưởng latestVersion trong cache, không tin tưởng localVersion hoặc hasUpdate của nó
                if (cachedObj && cachedObj.latestVersion && cachedObj.latestVersion !== "Check Failed") {
                    remoteVer = cachedObj.latestVersion;
                    usedCache = true;
                }
            } catch (e) {
                // Phân tích JSON thất bại, bỏ qua cache
            }
        }
    }

    // 3. Nếu không trúng cache (hoặc làm mới bắt buộc), hãy yêu cầu GitHub API
    if (!remoteVer) {
        remoteVer = await getRemoteVersion();
        
        // Chỉ cập nhật dấu thời gian khi lấy phiên bản từ xa thành công
        if (remoteVer) {
            localStorage.setItem(KEY_LAST_CHECK, now.toString());
        }
    }

    // 4. So sánh phiên bản theo thời gian thực
    // Sử dụng "localVer thực tế" và "remoteVer có thể từ cache" để so sánh
    const hasUpdate = (remoteVer && localVer !== "Unknown" && localVer !== "Error") 
        ? compareVersions(remoteVer, localVer) > 0 
        : false;

    // Xây dựng đối tượng kết quả
    const result = {
        hasUpdate: hasUpdate,
        latestVersion: remoteVer || "Check Failed",
        localVersion: localVer, // Ở đây sử dụng phiên bản cục bộ mới nhất
        checkedAt: usedCache ? parseInt(lastCheck || now) : now
    };

    // 5. Cập nhật nội dung cache
    // Ngay cả khi chúng ta dùng remoteVer từ cache, việc lưu lại result mới nhất vẫn là một thói quen tốt
    // Bằng cách này, nếu người dùng làm mới trang lần sau, localVersion trong cache sẽ chính xác (mặc dù logic bên trên của chúng ta đã bỏ qua nó)
    if (remoteVer) {
        localStorage.setItem(KEY_UPDATE_INFO, JSON.stringify(result));
    }

    return result;
}

export async function getChangelog() {
    try {
        const response = await fetch(CHANGELOG_URL + `?t=${Date.now()}`);
        return await response.text();
    } catch (e) {
        return translate("Không thể lấy nhật ký cập nhật.", 'qra_changelog_unavailable');
    }
}

export async function performUpdate() {
    try {
        // Thực thi lại logic tìm kiếm để lấy folderPath chính xác
        const discoverResponse = await fetch('/api/extensions/discover');
        const extensions = await discoverResponse.json();
        let targetFolder = null;
        let isGlobal = false;

        // Duyệt qua tìm kiếm đơn giản
        for (const ext of extensions) {
            try {
                const res = await fetch(`/scripts/extensions/${ext.name}/manifest.json`);
                if (res.ok) {
                    const m = await res.json();
                    // Logic khớp tương tự
                    if (m.display_name === "QR Assistant" ||
                        ext.name.endsWith("/QR") ||
                        ext.name === "QR") {
                        targetFolder = ext.name; // Ở đây sẽ là "third-party/QR"
                        isGlobal = ext.type === 'global'; // Ghi nhận loại tiện ích
                        break;
                    }
                }
            } catch(e) {}
        }

        if (!targetFolder) {
            Logger.error(LogCategory.UPDATE, 'Không tìm thấy thư mục tiện ích, không thể cập nhật');
            return { ok: false };
        }

        Logger.info(LogCategory.UPDATE, `Đang cập nhật tiện ích: ${targetFolder}`);

        // Backend API cần loại bỏ tiền tố "third-party/" để lấy tên ngắn và truyền rõ tham số global
        const shortName = targetFolder.replace(/^third-party\//, '');

        // Sử dụng getRequestHeaders() thay vì tự ghép thủ công
        // getRequestHeaders() sẽ tự động trả về { 'Content-Type': 'application/json', 'X-CSRF-Token': '...' }
        return await fetch('/api/extensions/update', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                extensionName: shortName,
                global: isGlobal
            })
        });
    } catch (e) {
        Logger.error(LogCategory.UPDATE, 'Cập nhật thất bại', e);
        return { ok: false };
    }

}

