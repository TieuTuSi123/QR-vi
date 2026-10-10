// whitelist.js (Refactored)
import * as Constants from './constants.js';
import { fetchQuickReplies, getThirdPartyRegistry } from './api.js';
import { Logger, LogCategory } from './logger.js';

// Kiểm tra xem một ID có nằm trong danh sách trắng không (Gộp người dùng định nghĩa + tích hợp)
function checkIsWhitelisted(id, userWhitelist) {
    if (!id) return false;
    // 1. Kiểm tra danh sách trắng tích hợp
    if (Constants.BUILTIN_WHITELIST.includes(id)) return true;
    // 2. Kiểm tra danh sách trắng của người dùng
    return userWhitelist.includes(id);
}

// Hàm xử lý cốt lõi
function processElement(element, userWhitelist, qrApi) {
    if (!element || !element.classList) return;

    let idToCheck = null;
    let detectionType = 'Unknown';
    
    // [DEBUG] In thông tin cơ bản của từng phần tử DOM liên quan đang được xử lý
    // Chỉ lọc bỏ các div hoàn toàn không liên quan, giữ lại các phần tử có vẻ là container (bộ chứa)
    if (element.classList.contains('qr--buttons') || element.id.startsWith('script_container_')) {
        Logger.debug(LogCategory.WHITELIST, `[ProcessElement] Đang kiểm tra phần tử DOM`, {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            innerHTMLPrefix: element.innerHTML.substring(0, 30)
        });
    }

    // 1. Nhận diện Input Helper / Custom Buttons
    if (element.id && Constants.BUILTIN_WHITELIST.includes(element.id)) {
        idToCheck = element.id;
        detectionType = 'Builtin_ID';
    }
    // 2. Nhận diện container JSR
    else if (element.id && element.id.startsWith('script_container_')) {
        const scriptId = element.id.substring('script_container_'.length);
        idToCheck = `JSR::${scriptId}`;
        detectionType = 'JSR_Container';
    }
    // 3. Nhận diện container Set của QR v2
    else if (element.classList.contains('qr--buttons')) {
        const sets = getAllQrSets(qrApi);
        const setData = sets.get(element);
        
        if (setData?.name) {
            idToCheck = `QRV2::${setData.name}`;
            detectionType = 'QRV2_Set';
        } else {
            // [CRITICAL DEBUG] Nếu là qr--buttons nhưng không lấy được từ sets, nghĩa là tham chiếu không khớp!
            // Bắt đầu khắc phục sự cố mất tham chiếu trên iOS tại đây
            Logger.warn(LogCategory.WHITELIST, `[ProcessElement] Phát hiện qr--buttons mồ côi, không thể khớp với dữ liệu API!`, {
                elementOuterHTML: element.outerHTML.substring(0, 100)
            });

            // So sánh sâu: Duyệt qua tất cả các Key trong Map, kiểm tra xem có "trông giống nhau" nhưng "tham chiếu khác nhau" không
            let matchFoundByStructure = false;
            sets.forEach((val, keyDom) => {
                const isRefEqual = (keyDom === element);
                const isEqualNode = keyDom.isEqualNode(element);
                const isOuterHtmlEqual = keyDom.outerHTML === element.outerHTML;

                if (isEqualNode || isOuterHtmlEqual) {
                    Logger.error(LogCategory.WHITELIST, `[Xác nhận mất tham chiếu] Tìm thấy DOM có cấu trúc giống hệt, nhưng tham chiếu không bằng nhau!`, {
                        setName: val.name,
                        refEqual: isRefEqual,     // Kỳ vọng là false
                        nodeEqual: isEqualNode,   // Kỳ vọng là true
                        htmlEqual: isOuterHtmlEqual // Kỳ vọng là true
                    });
                    matchFoundByStructure = true;
                }
            });

            if (!matchFoundByStructure) {
                Logger.warn(LogCategory.WHITELIST, `[ProcessElement] qr--buttons này hoàn toàn không có cấu trúc tương ứng trong cache API`);
            }
        }
    }

    // Ghi log và xử lý cốt lõi
    if (idToCheck) {
        const isWhitelisted = checkIsWhitelisted(idToCheck, userWhitelist);
        const action = isWhitelisted ? 'SHOW (Whitelist)' : 'HIDE';

        Logger.info(LogCategory.CORE, `Khớp thành công: ${detectionType} -> ${idToCheck}`, {
            whitelisted: isWhitelisted,
            action: action
        });

        if (isWhitelisted) {
            element.classList.add('qrq-whitelisted-original');
            element.classList.remove('qrq-hidden-by-plugin');
        } else {
            element.classList.add('qrq-hidden-by-plugin');
            element.classList.remove('qrq-whitelisted-original');
        }
    }
}

// Cache ánh xạ các QR Sets (Tái sử dụng logic cũ nhưng đơn giản hóa)
let allQrSetsCache = new Map();
function getAllQrSets(qrApi) {
    allQrSetsCache.clear();
    let totalFound = 0;

    const collect = (list, source) => {
        if (!Array.isArray(list)) return;
        list.forEach(link => {
            if (link?.set?.dom && link.set.name) {
                allQrSetsCache.set(link.set.dom, { name: link.set.name, source });
                totalFound++;
                // [DEBUG] Ghi nhận đặc điểm DOM được lưu trữ trong cache
                Logger.debug(LogCategory.WHITELIST, `[MapCache] Lưu vào tập hợp: ${link.set.name}`, {
                    source,
                    domId: link.set.dom.id,
                    domClass: link.set.dom.className,
                    childCount: link.set.dom.children.length
                });
            }
        });
    };
    
    collect(qrApi?.settings?.config?.setList, 'global');
    collect(qrApi?.settings?.chatConfig?.setList, 'chatConfig');
    collect(qrApi?.settings?.charConfig?.setList, 'charConfig');
    
    Logger.info(LogCategory.WHITELIST, `[getAllQrSets] Xây dựng cache hoàn tất, tổng cộng ${totalFound} tập hợp`);
    return allQrSetsCache;
}

export function applyWhitelistDOMChanges() {
    const qrBar = document.getElementById('qr--bar');
    if (!qrBar) {
        Logger.warn(LogCategory.WHITELIST, 'Không tìm thấy phần tử #qr--bar, dừng cập nhật DOM');
        return;
    }
    
    const settings = window.SillyTavern?.getContext()?.extensionSettings?.[Constants.EXTENSION_NAME];
    if (!settings) return;
    
    Logger.info(LogCategory.CORE, '=== Bắt đầu thực thi cập nhật DOM danh sách trắng ===');
    
    // [DEBUG] In tổng quan các phần tử con hiện tại của qr--bar, xác nhận xem container có tồn tại không
    Logger.debug(LogCategory.WHITELIST, `[Ảnh chụp QR-BAR] Số lượng phần tử con: ${qrBar.children.length}`, {
        children: Array.from(qrBar.children).map(c => `${c.tagName}#${c.id}.${c.className}`)
    });

    const userWhitelist = Array.isArray(settings.whitelist) ? settings.whitelist : [];
    const pluginEnabled = settings?.enabled !== false;
    const qrApi = window.quickReplyApi;

    // Dọn dẹp trạng thái cũ
    const elementsToReset = qrBar.querySelectorAll('.qrq-whitelisted-original, .qrq-hidden-by-plugin, .qrq-wrapper-visible, .qrq-mixed-content');
    elementsToReset.forEach(el => el.classList.remove('qrq-whitelisted-original', 'qrq-hidden-by-plugin', 'qrq-wrapper-visible', 'qrq-mixed-content'));

    if (!pluginEnabled) {
        document.body.classList.remove('qra-enabled');
        document.body.classList.add('qra-disabled');
        return;
    }
    document.body.classList.add('qra-enabled');

    // --- Tiền xử lý nút đặc biệt của bên thứ ba (Cơ chế Registry động) ---
    const thirdPartyRegistry = getThirdPartyRegistry();

    thirdPartyRegistry.forEach(ext => {
        const domId = ext.dom_id;
        const isWhitelisted = userWhitelist.includes(domId);

        const btns = document.querySelectorAll(`[id="${domId}"]`);

        if (domId === 'pt-wb-common-button') {
            const fallbackBar = document.getElementById('pt-wb-common-fallback-bar');
            if (fallbackBar) {
                if (isWhitelisted) fallbackBar.classList.remove('qrq-hidden-by-plugin');
                else fallbackBar.classList.add('qrq-hidden-by-plugin');
            }
        }

        btns.forEach(btn => {
            if (isWhitelisted) {
                btn.classList.add('qrq-whitelisted-original');
                btn.classList.remove('qrq-hidden-by-plugin');
            } else {
                btn.classList.add('qrq-hidden-by-plugin');
                btn.classList.remove('qrq-whitelisted-original');
            }
        });
    });

    // --- Xử lý đặc biệt cho nút LWB (Vì chúng không có container mà là các nút đơn lẻ) ---
    if (window.XBTasks) {
        // Lấy tất cả tên nhiệm vụ của nhân vật hiện tại, dùng để so sánh
        let charTasksNames = new Set();
        if (window.XBTasks.character && Array.isArray(window.XBTasks.character)) {
            window.XBTasks.character.forEach(t => charTasksNames.add(t.name));
        }

        const lwbButtons = qrBar.querySelectorAll('.xiaobaix-task-button');
        lwbButtons.forEach(btn => {
            const taskName = btn.dataset.taskName;
            let isWhite = false;

            if (charTasksNames.has(taskName)) {
                isWhite = userWhitelist.includes('LWB::Character_Set');
            } else {
                isWhite = userWhitelist.some(wid => wid.endsWith(`::${taskName}`) && wid.startsWith('LWB::'));
            }

            Logger.info(LogCategory.CORE, `Đang phát hiện nút LWB: ${taskName}`, {
                scope: charTasksNames.has(taskName) ? 'Character' : 'Global/Preset',
                isWhitelisted: isWhite
            });

            if (isWhite) {
                btn.classList.add('qrq-whitelisted-original');
            } else {
                btn.classList.add('qrq-hidden-by-plugin');
            }
        });
    }

    // --- Xử lý chống trùng lặp cho nút LWB (Sửa lỗi hiển thị kép ở chế độ không gộp) ---
    // Nguyên nhân: LWB có thể tiêm các nút giống hệt nhau vào nhiều container cùng lúc (như QR Bar và JSR Script Container).
    // Nếu tất cả các container này đều bị đánh giá là "Mixed Content", sẽ dẫn đến nút xuất hiện trùng lặp.
    if (window.XBTasks) {
        const seenTasks = new Set();
        // Tìm lại tất cả các nút LWB vừa được đánh dấu nằm trong danh sách trắng
        const whiteLwbButtons = qrBar.querySelectorAll('.xiaobaix-task-button.qrq-whitelisted-original');

        whiteLwbButtons.forEach(btn => {
            const name = btn.dataset.taskName;
            if (name) {
                if (seenTasks.has(name)) {
                    // Nếu tên nhiệm vụ này đã xuất hiện trước đó (tức là trùng lặp), buộc gỡ bỏ dấu hiệu danh sách trắng và ẩn đi
                    // Như vậy container chứa nó sẽ không bị phán đoán nhầm là Mixed Content do nút này
                    btn.classList.remove('qrq-whitelisted-original');
                    btn.classList.add('qrq-hidden-by-plugin');
                } else {
                    seenTasks.add(name);
                }
            }
        });
    }

    // --- Xử lý container (Hỗ trợ chế độ gộp Wrapper của ST) ---
    // Kiểm tra xem có được bọc trong wrapper không
    let wrapper = null;
    for (const child of qrBar.children) {
        // Dấu hiệu nhận biết Wrapper: Không có ID, chứa phần tử con qr--buttons
        if (!child.id && child.querySelector('.qr--buttons')) {
            wrapper = child;
            break;
        }
    }

    const processList = (elements) => {
        elements.forEach(el => processElement(el, userWhitelist, qrApi));
    };

    // --- Tối ưu hóa logic cốt lõi: Xử lý tất cả các container (Bao gồm bên trong và ngoài Wrapper) ---
    // 1. Trước tiên chạy logic ẩn/hiện cơ bản (Sẽ đánh dấu qrq-hidden-by-plugin hoặc qrq-whitelisted-original)
    const allContainers = qrBar.querySelectorAll('.qr--buttons, [id^="script_container_"]');
    processList(allContainers);

    // 2. Kiểm tra lần 2: Xử lý "trạng thái hỗn hợp" (Mixed state)
    // Ở chế độ không gộp, các nút LWB sẽ được tiêm vào bên trong .qr--buttons.
    // Nếu .qr--buttons bị hàm processList ở trên đánh dấu là bị ẩn, nhưng bên trong nó có các nút LWB nằm trong danh sách trắng,
    // chúng ta phải buộc hiển thị container đó, và đánh dấu là mixed (CSS sẽ xử lý việc ẩn các phần tử con thông thường không thuộc danh sách trắng bên trong).
    allContainers.forEach(container => {
        // Tối ưu hóa: Nếu container là một script container JSR (id^="script_container_") và bản thân nó không nằm trong danh sách trắng,
        // ngay cả khi có các nút LWB lẫn vào bên trong nó, chúng ta thông thường cũng không nên hiển thị nó dưới dạng container hỗn hợp.
        // Vì các nút LWB thường cũng sẽ tồn tại trong container QR chính (đã được giữ lại bởi logic chống trùng lặp ở trên).
        // Cố tình hiển thị JSR container có thể gây rối loạn bố cục hoặc lặp lại.
        const isJsrContainer = container.id && container.id.startsWith('script_container_');
        const isSelfWhitelisted = container.classList.contains('qrq-whitelisted-original');

        if (isJsrContainer && !isSelfWhitelisted) {
            return; // Bỏ qua việc phát hiện hỗn hợp cho JSR container
        }

        // Kiểm tra xem có phần tử con nào được đánh dấu hiển thị theo danh sách trắng không
        const hasVisibleChild = container.querySelector('.qrq-whitelisted-original');

        if (hasVisibleChild) {
            // Nếu bản thân container đã bị ẩn, hoặc nó cần hiển thị dưới dạng container hỗn hợp
            if (container.classList.contains('qrq-hidden-by-plugin')) {
                container.classList.remove('qrq-hidden-by-plugin');
                container.classList.add('qrq-mixed-content');
            } else if (!isSelfWhitelisted) {
                // Bản thân container không được chọn vào danh sách trắng (hiển thị bình thường), nhưng cũng có thể đang ở trạng thái hỗn hợp
                // Trong trường hợp này, thêm lớp mixed có thể đảm bảo CSS ẩn đi những phần tử con thông thường không cần thiết
                container.classList.add('qrq-mixed-content');
            }
        }
    });

    // --- Xử lý đặc biệt cho Wrapper (Giữ nguyên logic của chế độ gộp ST) ---
    if (wrapper) {
        // Kiểm tra xem bên trong Wrapper có nội dung hiển thị nào không (Phần tử con trong danh sách trắng, phần tử tích hợp sẵn, hoặc container hỗn hợp)
        const hasWhitelistedInner = wrapper.querySelector('.qrq-whitelisted-original');
        const hasBuiltIn = Constants.BUILTIN_WHITELIST.some(id => wrapper.querySelector(`#${id}`));
        const hasMixed = wrapper.querySelector('.qrq-mixed-content');

        if (hasWhitelistedInner || hasBuiltIn || hasMixed) {
            wrapper.classList.add('qrq-wrapper-visible');
        } else {
            wrapper.classList.add('qrq-hidden-by-plugin');
        }
    }

    // Lọc hiển thị của các mục trong menu (Nếu đã hiển thị trên thanh do nằm trong danh sách trắng, thì xóa khỏi menu)
    filterMenuItems(userWhitelist);

    Logger.debug(LogCategory.WHITELIST, 'Việc áp dụng thay đổi DOM cho danh sách trắng đã hoàn tất');
}

function filterMenuItems(whitelist) {
    // Ẩn các mục trên menu mà đã nằm trong danh sách trắng
    const items = document.querySelectorAll(`.${Constants.CLASS_ACTION_ITEM}`);
    items.forEach(btn => {
        let id = '';
        const source = btn.dataset.source;
        if (source === 'JSSlashRunner') id = `JSR::${btn.dataset.scriptId}`;
        else if (source === 'QuickReplyV2') id = `QRV2::${btn.dataset.setName}`;
        else if (source === 'LittleWhiteBox') {
            // Xử lý đặc biệt cho nhiệm vụ LWB của nhân vật
            if (btn.dataset.taskScope === 'character') {
                id = 'LWB::Character_Set';
            } else {
                id = `LWB::${btn.dataset.taskScope}::${btn.dataset.taskId}`;
            }
        }
        else if (source === 'RawDomElement') id = btn.dataset.domId;

        // Đồng thời kiểm tra danh sách trắng người dùng và danh sách trắng tích hợp
        // Trong CSS, .action-item được gán display: flex !important
        // Do đó, dùng btn.style.display = 'none' thông thường sẽ không có tác dụng
        // Phải sử dụng setProperty kèm theo độ ưu tiên 'important'
        if (id && checkIsWhitelisted(id, whitelist)) {
            btn.style.setProperty('display', 'none', 'important');
        } else {
            btn.style.setProperty('display', 'flex', 'important');
        }
    });
}

// Bộ quan sát debouce (chống rung) đơn giản
let debounceTimer = null;
export function observeBarMutations() {
    const target = document.getElementById('send_form') || document.body;
    const obs = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            applyWhitelistDOMChanges();

            // Sửa lỗi: Khi thanh nút thay đổi (ví dụ: bật/tắt script JSR), làm mới ngay lập tức danh sách trắng trong bảng cài đặt
            if (window.quickReplyMenu && typeof window.quickReplyMenu.populateWhitelistManagementUI === 'function') {
                // Chỉ thực thi khi bộ chứa danh sách hiện diện trong DOM (tức là bảng cài đặt đã được tải)
                if (document.getElementById('qrq-non-whitelisted-list')) {
                    window.quickReplyMenu.populateWhitelistManagementUI();
                }
            }
        }, 200);
    });
    obs.observe(target, { childList: true, subtree: true });
}
