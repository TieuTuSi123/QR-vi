// api.js
import * as Constants from './constants.js';
import { Logger, LogCategory } from './logger.js';

// Key JSR phiên bản mới
const JSR_DATA_KEY = "tavern_helper";

/**
 * Lấy tất cả phản hồi nhanh (Phân loại: Công cụ kịch bản vs Phản hồi nhanh tiêu chuẩn)
 */
export function fetchQuickReplies() {
    // [DEBUG] Log đầu vào
    Logger.info(LogCategory.API, '>>> fetchQuickReplies bắt đầu thực thi');
    
    const stContext = window.SillyTavern?.getContext();
    const finalScriptReplies = []; 
    const finalStandardReplies = []; 
    const processedLabels = new Set();

    // [DEBUG] Kiểm tra trạng thái đối tượng QR API
    if (!window.quickReplyApi) {
        Logger.warn(LogCategory.API, 'window.quickReplyApi chưa được định nghĩa hoặc không tồn tại');
    } else {
        Logger.debug(LogCategory.API, 'window.quickReplyApi tồn tại', {
            isEnabled: window.quickReplyApi.settings?.isEnabled,
            hasSettings: !!window.quickReplyApi.settings
        });
    }

    // 1. Quick Reply v2 (Tiêu chuẩn) -> Phân loại vào Standard
    if (window.quickReplyApi && window.quickReplyApi.settings?.isEnabled !== false) {
        const qrApi = window.quickReplyApi;
        
        const processQrLevel = (setList, scope) => {
            // [DEBUG] Kiểm tra SetList
            if (!Array.isArray(setList)) {
                Logger.debug(LogCategory.API, `[QRV2] scope=${scope}: setList không phải là mảng hoặc trống`, { setList });
                return;
            }
            
            Logger.info(LogCategory.API, `[QRV2] Bắt đầu xử lý scope=${scope}, số lượng tập hợp: ${setList.length}`);

            setList.forEach((setLink, idx) => {
                // [DEBUG] Kiểm tra từng SetLink
                const setName = setLink?.set?.name || "UnknownSet";
                const isVisible = setLink?.isVisible;
                const qrCount = setLink?.set?.qrList?.length || 0;

                Logger.debug(LogCategory.API, `[QRV2] Kiểm tra tập hợp #${idx} (${setName})`, {
                    isVisible,
                    qrCount,
                    domExists: !!setLink?.set?.dom, // Quan trọng: Kiểm tra xem tham chiếu DOM có tồn tại không
                    domHTML: setLink?.set?.dom ? setLink.set.dom.outerHTML.substring(0, 50) + '...' : 'null'
                });

                if (setLink?.isVisible && setLink.set?.qrList) {
                    setLink.set.qrList.forEach(qr => {
                        if (qr && !qr.isHidden && qr.label) {
                            const label = qr.label.trim();
                            if (label && !processedLabels.has(label)) {
                                finalStandardReplies.push({
                                    setName: setLink.set.name,
                                    label,
                                    message: qr.message,
                                    isStandard: true,
                                    source: 'QuickReplyV2',
                                    scope: scope 
                                });
                                processedLabels.add(label);
                                
                                // [DEBUG] Đã bắt thành công nút
                                // Logger.debug(LogCategory.API, `[QRV2] Đã bắt nút: [${label}]`);
                            } else {
                                 // [DEBUG] Nút bị bỏ qua
                                 // Logger.debug(LogCategory.API, `[QRV2] Bỏ qua nút: [${qr.label}] (trùng lặp hoặc trống)`);
                            }
                        }
                    });
                }
            });
        };
        processQrLevel(qrApi.settings?.chatConfig?.setList, 'character (chatConfig)');
        processQrLevel(qrApi.settings?.charConfig?.setList, 'character (charConfig)');
        processQrLevel(qrApi.settings?.config?.setList, 'global (config)');
    }

    // 2. Tavern Helper / JSR (Chỉ dành cho Modern API) -> Phân loại vào Scripts
    try {
        const newApi = window.TavernHelper?.getAllEnabledScriptButtons;
        if (typeof newApi === 'function') {
            Logger.debug(LogCategory.API, 'Bắt đầu lấy các nút kịch bản JSR');
            const enabledButtonsMap = newApi();
            const scriptNameMap = new Map();
            const globalScriptIds = new Set();

            const flatten = (items) => {
                if (!Array.isArray(items)) return [];
                const res = [];
                items.forEach(item => {
                    if (item.type === 'folder' && Array.isArray(item.scripts)) res.push(...item.scripts);
                    else if (item.type === 'folder' && Array.isArray(item.value)) res.push(...item.value);
                    else if (item.type === 'script' && item.value) res.push(item.value);
                    else if (item.id) res.push(item);
                });
                return res;
            };

            const parseJsrData = (data) => {
                if (!data) return null;
                if (Array.isArray(data)) { try { return Object.fromEntries(data); } catch (e) { return null; } }
                return data;
            };

            // A. Global
            const jsrSettings = stContext?.extensionSettings?.[JSR_DATA_KEY];
            const globalScripts = jsrSettings?.script?.scripts || jsrSettings?.scripts;
            if (globalScripts) flatten(globalScripts).forEach(s => {
                scriptNameMap.set(s.id, s.name);
                globalScriptIds.add(s.id);
            });

            // B. Preset
            if (window.TavernHelper?.getLoadedPresetName && window.TavernHelper?.getPreset) {
                try {
                    const loadedName = window.TavernHelper.getLoadedPresetName();
                    const presetObj = window.TavernHelper.getPreset(loadedName);
                    const jsrData = presetObj?.extensions?.[JSR_DATA_KEY];
                    const scripts = parseJsrData(jsrData)?.scripts;
                    if (scripts) flatten(scripts).forEach(s => {
                        scriptNameMap.set(s.id, s.name);
                        globalScriptIds.add(s.id);
                    });
                } catch (e) {}
            }
            const presetData = window.oai_settings?.extensions?.[JSR_DATA_KEY];
            const presetScripts = parseJsrData(presetData)?.scripts;
            if (presetScripts) flatten(presetScripts).forEach(s => {
                scriptNameMap.set(s.id, s.name);
                globalScriptIds.add(s.id);
            });

            // C. Character
            const charDataRaw = stContext?.characters?.[stContext.characterId]?.data?.extensions?.[JSR_DATA_KEY];
            const charScripts = parseJsrData(charDataRaw)?.scripts;
            if (charScripts) flatten(charScripts).forEach(s => scriptNameMap.set(s.id, s.name));

            // Xử lý các nút
            for (const script_id in enabledButtonsMap) {
                // Thêm kiểm tra giá trị null/trống
                if (!Array.isArray(enabledButtonsMap[script_id])) continue;

                enabledButtonsMap[script_id].forEach(btn => {
                    const label = btn.button_name?.trim(); // Truy cập an toàn tới trim
                    if (label && !processedLabels.has(label)) {
                        const isGlobal = globalScriptIds.has(script_id);

                        finalScriptReplies.push({
                            setName: scriptNameMap.get(script_id) || 'JS Script',
                            label: label,
                            isStandard: false,
                            source: 'JSSlashRunner',
                            isApiBased: true,
                            buttonId: btn.button_id,
                            scriptId: script_id,
                            scope: isGlobal ? 'global' : 'character'
                        });
                        processedLabels.add(label);
                    }
                });
            }
        }
    } catch (e) {
        Logger.warn(LogCategory.API, 'Lấy nút kịch bản JSR thất bại', e);
    }

    // 3. LittleWhiteBox (Chỉ XBTasks) -> Phân loại vào Scripts
    if (window.XBTasks) {
        try {
            let lwbTasks = null;

            // 1. Ưu tiên thử đọc trực tiếp thuộc tính Getter (LWB phiên bản mới)
            // Nguyên nhân: Dữ liệu trả về từ window.XBTasks.list() không chứa trường buttonActivated, dẫn đến không thể xác định có hiển thị nút hay không.
            // Trong khi đó, các thuộc tính .global / .character trả về tham chiếu gốc, chứa đầy đủ các trường.
            if ('global' in window.XBTasks || 'character' in window.XBTasks) {
                lwbTasks = {
                    global: window.XBTasks.global || [],
                    character: window.XBTasks.character || [],
                    preset: window.XBTasks.preset || []
                };
            }
            // 2. Dự phòng: Thử dùng giao diện đồng bộ cũ dump (chỉ sử dụng khi nó tồn tại và không phải là Promise)
            else if (typeof window.XBTasks.dump === 'function') {
                const dumpResult = window.XBTasks.dump('all');
                // Đảm bảo không phải là Promise (phiên bản cũ là đối tượng đồng bộ, phiên bản mới là Promise)
                if (dumpResult && typeof dumpResult.then !== 'function') {
                    lwbTasks = dumpResult;
                }
            }

            if (lwbTasks) {
                const processLwb = (tasks, scope) => {
                    if (!Array.isArray(tasks)) return;

                    // Lấy tên nhân vật hiện tại (chỉ cần thiết khi scope là character)
                    let charName = "Character";
                    if (scope === 'character' && stContext?.characterId) {
                        charName = stContext.characters[stContext.characterId]?.name || "Character";
                    }

                    tasks.forEach(t => {
                        // Thêm kiểm tra t.buttonActivated, đảm bảo chỉ lấy các tác vụ đã được cấu hình "kích hoạt bằng nút"
                        if (t && !t.disabled && t.name && t.buttonActivated) {
                            const label = t.name.trim();
                            if (label && !processedLabels.has(label)) {

                                // Sửa đổi logic: Nếu là tác vụ của nhân vật, setName được đặt thành tên nhân vật (để nhóm hiển thị trên menu)
                                // Đồng thời đánh dấu isLwbCharSet (để gộp giao diện cài đặt)
                                const isCharSet = scope === 'character';
                                const finalSetName = isCharSet ? charName : `LWB-${scope}-${t.name}`;

                                finalScriptReplies.push({
                                    setName: finalSetName,
                                    label: label,
                                    message: t.commands || '',
                                    isStandard: false,
                                    source: 'LittleWhiteBox',
                                    taskId: t.name,
                                    taskScope: scope,
                                    scope: scope, // Giữ cách đặt tên thống nhất
                                    isLwbCharSet: isCharSet // Đánh dấu mới thêm
                                });
                                processedLabels.add(label);
                            }
                        }
                    });
                };
                processLwb(lwbTasks.character, 'character');
                processLwb(lwbTasks.global, 'global');
                processLwb(lwbTasks.preset, 'preset');
            }
        } catch (e) {
            Logger.error(LogCategory.API, 'Lấy tác vụ LWB thất bại', e);
        }
    }

    // 4. Nút của Plugin bên thứ ba (Preset tích hợp + API mở)
    const thirdPartyRegistry = getThirdPartyRegistry();

    thirdPartyRegistry.forEach(config => {
        const btn = document.getElementById(config.dom_id);
        if (btn) {
            let label = config.button_name || btn.title || btn.textContent || "Ext Button";
            label = label.trim();
            if (!label) label = "Ext Button";

            // Nhận diện thông minh các tên class icon thuần FontAwesome và tự động chuyển đổi thành thẻ HTML
            if (/^(fa|fas|far|fab|fa-solid|fa-regular|fa-brands)\s+fa-[\w-]+$/.test(label)) {
                label = `<i class="${label}"></i>`;
            }

            finalScriptReplies.push({
                setName: config.group_name || 'Plugin Tavern',
                label: label,
                isStandard: false,
                source: 'RawDomElement',
                domId: config.dom_id,
                scope: 'global'
            });
        }
    });

    const result = { scripts: finalScriptReplies, standard: finalStandardReplies };
    Logger.info(LogCategory.API, '<<< fetchQuickReplies kết thúc thực thi', {
        scriptsCount: result.scripts.length,
        standardCount: result.standard.length,
        total: result.scripts.length + result.standard.length
    });
    return result;
}

export function getThirdPartyRegistry() {
    const registry = [
        {
            dom_id: 'pt-wb-common-button',
            group_name: 'Công cụ Chuyển đổi Preset',
            button_name: 'Sách Thế giới (Worldbook) Thường dùng'
        },
        {
            dom_id: 'zero-preset-btn',
            group_name: 'Quản lý Preset',
            button_name: 'fa-solid fa-camera'
        }
    ];

    if (Array.isArray(window.qrAssistantExtensionApi)) {
        registry.push(...window.qrAssistantExtensionApi);
    }

    return registry;
}

export async function triggerQuickReply(setName, label) {
    if (window.quickReplyApi) await window.quickReplyApi.executeQuickReply(setName, label);
}

export async function triggerJsRunnerScript(replyData) {
    const stContext = window.SillyTavern?.getContext();
    if (replyData.isApiBased && replyData.buttonId) {
        await stContext?.eventSource?.emit(replyData.buttonId);
    }
}

export async function triggerLwbTask(taskName) {
    if (typeof window.xbqte === 'function') await window.xbqte(taskName);
}

export function triggerRawDom(domId) {
    const el = document.getElementById(domId);
    if (el) {
        el.click();
        Logger.debug(LogCategory.API, `Kích hoạt nhấp chuột vào phần tử DOM`, { domId });
    } else {
        Logger.warn(LogCategory.API, `Không tìm thấy phần tử DOM`, { domId });
    }
}
