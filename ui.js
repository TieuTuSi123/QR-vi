// ui.js
import * as Constants from './constants.js';
import { fetchQuickReplies } from './api.js';
import { sharedState } from './state.js';
import { applyWhitelistDOMChanges } from './whitelist.js';
import { Logger, LogCategory } from './logger.js';
import { saveSettings, applyThemeStyles, updateIconDisplay } from './settings.js';
import { translate } from '../../../i18n.js';

// Hàm hỗ trợ logic tự động ẩn/hiện thanh cuộn (Được export để dùng trong Settings)
export const attachScrollListener = (element) => {
    let scrollTimeout;
    element.addEventListener('scroll', () => {
        // Thêm class để hiển thị thanh cuộn
        if (!element.classList.contains('is-scrolling')) {
            element.classList.add('is-scrolling');
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            element.classList.remove('is-scrolling');
        }, 500); // Ẩn thanh cuộn sau khi ngừng cuộn 0.5s
    }, { passive: true });

    // Hiển thị thanh cuộn khi di chuột vào, tránh việc nó biến mất khi người dùng muốn kéo
    element.addEventListener('mouseenter', () => element.classList.add('is-scrolling'));
    element.addEventListener('mouseleave', () => element.classList.remove('is-scrolling'));
};

export function createMenuElement() {
    const menu = document.createElement('div');
    menu.id = Constants.ID_MENU;
    menu.setAttribute('role', 'dialog');
    menu.tabIndex = -1;

    // 1. Tạo lớp bọc nội dung (Chứa hai cột trái phải như trước)
    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'qr-body-container';

    // 2. Cột trái
    const leftColumn = document.createElement('div');
    leftColumn.className = 'column column-left';
    const leftList = document.createElement('div');
    leftList.className = 'action-list';
    leftList.id = 'qr-list-left';
    attachScrollListener(leftList);
    leftColumn.appendChild(leftList);

    // 3. Cột phải
    const rightColumn = document.createElement('div');
    rightColumn.className = 'column column-right';
    const rightList = document.createElement('div');
    rightList.className = 'action-list';
    rightList.id = 'qr-list-right';
    attachScrollListener(rightList);
    rightColumn.appendChild(rightList);

    // 4. Lắp ráp
    bodyContainer.appendChild(leftColumn);
    bodyContainer.appendChild(rightColumn);
    menu.appendChild(bodyContainer);

    return menu;
}

export function createQuickReplyItem(reply) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = Constants.CLASS_ACTION_ITEM;

    item.dataset.label = reply.label?.trim() || '';
    item.dataset.isStandard = String(reply.isStandard !== false);
    item.dataset.setName = reply.setName || 'Unknown';
    item.dataset.source = reply.source || 'Unknown';

    if (reply.source === 'JSSlashRunner') {
        item.dataset.isApiBased = String(!!reply.isApiBased);
        if (reply.isApiBased) item.dataset.buttonId = reply.buttonId;
        item.dataset.scriptId = reply.scriptId;
    } else if (reply.source === 'LittleWhiteBox') {
        item.dataset.taskId = reply.taskId;
        item.dataset.taskScope = reply.taskScope;
    } else if (reply.source === 'RawDomElement') {
        item.dataset.domId = reply.domId;
    }

    // Yêu cầu thứ 4: Bọc thẻ span bên trong để phối hợp với CSS nhằm căn giữa bằng margin: auto
    const span = document.createElement('span');

    // Hỗ trợ kết xuất thẻ HTML biểu tượng do plugin của bên thứ ba truyền vào
    if (item.dataset.label.includes('<i ') || item.dataset.label.includes('<img ')) {
        span.innerHTML = item.dataset.label;
    } else {
        span.textContent = item.dataset.label;
    }
    item.appendChild(span);

    // Yêu cầu thứ 3: Gỡ bỏ title mặc định, sử dụng logic di chuột tùy chỉnh
    item.removeAttribute('title');

    // =========================================================
    // Cấu hình: Có bật popup thông tin chi tiết hay không (Mặc định tắt)
    // Nếu muốn khôi phục tính năng hiển thị thông tin khi di chuột/nhấn giữ, hãy đổi biến bên dưới thành true
    const ENABLE_MENU_TOOLTIPS = false;
    // =========================================================

    if (ENABLE_MENU_TOOLTIPS) {
        // Ràng buộc sự kiện di chuột để hiển thị Tooltip tùy chỉnh
        item.addEventListener('mouseenter', (e) => {
            showTooltip(e, reply);
        });
        item.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    }

    // --- Logic nhấn giữ (Tương thích cả PC và Di động) ---
    let pressTimer;
    let hasTriggeredSortModal = false; // Đánh dấu đã kích hoạt popup sắp xếp hay chưa
    const clearTimer = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const handleLongPressStart = (e) => {
        clearTimer();
        hasTriggeredSortModal = false; // Đặt lại cờ kích hoạt

        // 1. Giữ nguyên logic hiển thị thông báo 600ms cũ (nếu ENABLE_MENU_TOOLTIPS được bật)
        if (ENABLE_MENU_TOOLTIPS) {
            // ... Logic toastr cũ đã được xử lý độc lập bên ngoài bộ lắng nghe sự kiện ...
        }

        // 2. Thêm mới logic kích hoạt sắp xếp tùy chỉnh sau 3000ms
        pressTimer = setTimeout(() => {
            hasTriggeredSortModal = true; // Đánh dấu đã kích hoạt

            // Phản hồi rung (Trên các thiết bị được hỗ trợ)
            if (navigator.vibrate) navigator.vibrate(50);

            // Mở popup quản lý sắp xếp trước
            if (window.quickReplyMenu && window.quickReplyMenu.openSortModal) {
                window.quickReplyMenu.openSortModal();
            }

            // Trì hoãn đóng menu để đảm bảo popup được mở ra trước
            requestAnimationFrame(() => {
                sharedState.menuVisible = false;
                updateMenuVisibilityUI();
            });

            // Xóa tham chiếu bộ hẹn giờ để tránh kích hoạt nhiều lần
            pressTimer = null;
        }, 3000); // Nhấn giữ 3 giây
    };

    const handleLongPressEnd = (e) => {
        // Nếu đã kích hoạt popup sắp xếp thì thoát luôn
        if (hasTriggeredSortModal) {
            hasTriggeredSortModal = false; // Đặt lại cờ
            clearTimer();
            return;
        }
        clearTimer();
    };

    // Gắn sự kiện cho Di động và PC
    item.addEventListener('touchstart', handleLongPressStart, { passive: true });
    item.addEventListener('touchend', handleLongPressEnd, { passive: true });
    item.addEventListener('touchmove', clearTimer, { passive: true });

    item.addEventListener('mousedown', handleLongPressStart);
    item.addEventListener('mouseup', handleLongPressEnd);
    item.addEventListener('mouseleave', clearTimer);

    if (ENABLE_MENU_TOOLTIPS) {
        // Giữ một bộ hẹn giờ riêng cho khoảng 600ms để tránh xung đột
        let tooltipTimer;
        item.addEventListener('touchstart', (e) => {
            tooltipTimer = setTimeout(() => {
                // Yêu cầu thứ 2: Nhấn giữ để hiển thị thông tin chi tiết
                // 1. Phân tích nguồn gốc
                let sourceText = translate('Nguồn không xác định', 'qra_source_unknown');
                if (reply.source === 'JSSlashRunner') sourceText = translate('Tavern Helper (JSR)', 'qra_source_jsr');
                else if (reply.source === 'QuickReplyV2') sourceText = translate('Phản hồi nhanh (QR)', 'qra_source_qr');
                else if (reply.source === 'LittleWhiteBox') sourceText = translate('LittleWhiteBox (LWB)', 'qra_source_lwb');
                else if (reply.source === 'RawDomElement') sourceText = translate('Tiện ích ST', 'qra_source_thirdparty') || 'Tiện ích ST';

                // 2. Phân tích phạm vi
                let scopeText = translate('Nhân vật', 'qra_scope_character');
                if (reply.scope === 'global') scopeText = translate('Toàn cục', 'qra_scope_global');
                else if (reply.scope === 'character') scopeText = translate('Nhân vật', 'qra_scope_character');
                else if (reply.scope === 'preset') scopeText = translate('Cài đặt sẵn', 'qra_scope_preset');

                // Phòng hờ để tương thích với logic cũ
                if (!reply.scope && reply.taskScope) {
                     scopeText = reply.taskScope === 'global' ? translate('Toàn cục', 'qra_scope_global') : translate('Nhân vật', 'qra_scope_character');
                }

                // 3. Nguồn của tập hợp/kịch bản
                const setSource = reply.setName || 'Default';
                const btnName = reply.label;

                // Xây dựng HTML
                const htmlContent = `
                    <div style="text-align:left; font-size:0.9em; line-height:1.5;">
                        <div>${translate('Nguồn', 'qra_tooltip_source')}: ${sourceText}</div>
                        <div>${translate('Phạm vi', 'qra_tooltip_scope')}: ${scopeText}</div>
                        <div>${translate('Thuộc về', 'qra_tooltip_belong')}: ${setSource}</div>
                        <div style="margin-top:4px; font-weight:bold; color:red; font-size:1.1em;">${btnName}</div>
                    </div>
                `;

                if (window.toastr) {
                    window.toastr.info(htmlContent, '', {
                        timeOut: 4000,
                        positionClass: 'toast-top-center',
                        preventDuplicates: true,
                        escapeHtml: false // Cho phép HTML
                    });
                } else {
                    alert(`${translate('Nguồn', 'qra_tooltip_source')}: ${sourceText}\n${translate('Phạm vi', 'qra_tooltip_scope')}: ${scopeText}\n${translate('Thuộc về', 'qra_tooltip_belong')}: ${setSource}\n${btnName}`);
                }
            }, 600);
        }, { passive: true });

        item.addEventListener('touchend', () => {
            if (tooltipTimer) {
                clearTimeout(tooltipTimer);
                tooltipTimer = null;
            }
        }, { passive: true });
        item.addEventListener('touchmove', () => {
            if (tooltipTimer) {
                clearTimeout(tooltipTimer);
                tooltipTimer = null;
            }
        }, { passive: true });
    }

    return item;
}

function createEmptyState(text) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.textContent = text;
    return div;
}

export function renderQuickReplies(scriptReplies, standardReplies) {
    const leftList = document.getElementById('qr-list-left');
    const rightList = document.getElementById('qr-list-right');

    if (!leftList || !rightList) return;

    const populateContainer = (container, replies, emptyText) => {
        container.innerHTML = '';
        const parentColumn = container.parentElement;
        const oldEmpty = parentColumn.querySelector('.empty-state');
        if (oldEmpty) oldEmpty.remove();

        if (replies && replies.length > 0) {
            container.style.display = 'flex';

            replies.forEach((reply, index) => {
                const btn = createQuickReplyItem(reply);

                // Gộp nền cho các nút có cùng nguồn gốc (setName)
                const prev = replies[index - 1];
                const next = replies[index + 1];
                const currSet = reply.setName;

                const isPrevSame = prev && prev.setName === currSet;
                const isNextSame = next && next.setName === currSet;

                if (!isPrevSame && isNextSame) {
                    btn.classList.add('group-start');
                } else if (isPrevSame && isNextSame) {
                    btn.classList.add('group-middle');
                } else if (isPrevSame && !isNextSame) {
                    btn.classList.add('group-end');
                }

                btn.addEventListener('click', (e) => {
                     if (window.quickReplyMenu?.handleQuickReplyClick) {
                        window.quickReplyMenu.handleQuickReplyClick(e);
                     }
                });
                container.appendChild(btn);
            });
        } else {
            container.style.display = 'none';
            parentColumn.appendChild(createEmptyState(emptyText));
        }
    };

    // Cột trái: Hiển thị các kịch bản (JSR, LWB)
    populateContainer(leftList, scriptReplies, translate('Không có nút kịch bản khả dụng', 'qra_empty_scripts'));
    // Cột phải: Hiển thị phản hồi nhanh tiêu chuẩn (QR v2)
    populateContainer(rightList, standardReplies, translate('Không có phản hồi nhanh khả dụng', 'qra_empty_standard'));
}

export function updateMenuVisibilityUI() {
    const { menu, rocketButton, backdrop } = sharedState.domElements;
    const show = sharedState.menuVisible;

    if (!menu || !rocketButton) return;

    if (show) {
        const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const isMobile = vw < 600;
        const targetWidth = isMobile ? vw * 0.95 : Math.min(vw * 0.85, 800);

        menu.style.width = `${targetWidth}px`;
        menu.style.maxHeight = `${vh - 40}px`;

        const settings = window.SillyTavern?.getContext()?.extensionSettings?.[Constants.EXTENSION_NAME];

        // Hiển thị (render) nội dung ở trạng thái ẩn trước, sau đó mới hiện menu để tránh hiện tượng giật hình "từ nhỏ phóng to" ở lần mở đầu tiên
        try {
            if (settings?.firstTimeSetupPending) {
                renderOnboardingHeader(menu, settings);
            } else {
                const header = document.getElementById(Constants.ID_ONBOARDING_HEADER);
                if (header) header.remove();
            }

            const { scripts, standard } = fetchQuickReplies();
            const { leftList, rightList } = performAutoGrouping(scripts, standard);

            renderQuickReplies(leftList, rightList);
            applyWhitelistDOMChanges();
        } catch (e) {
            Logger.error(LogCategory.UI, 'Lấy danh sách phản hồi thất bại', e);
            if (menu) {
                const bodyContainer = menu.querySelector('.qr-body-container');
                if (bodyContainer) {
                    bodyContainer.innerHTML = `
                        <div style="padding: 20px; width: 100%; text-align: center; color: #ff6b6b;">
                            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2em; margin-bottom: 10px;"></i>
                            <div style="font-weight: bold;">${translate('Lỗi khi hiển thị menu', 'qra_menu_render_error')}</div>
                            <div style="font-size: 0.8em; opacity: 0.8; margin-top: 5px;">${e.message || "Lỗi không xác định"}</div>
                            <div style="font-size: 0.8em; opacity: 0.6; margin-top: 10px;">${translate('Vui lòng nhấn F12 để xem nhật ký chi tiết trong Console', 'qra_menu_check_console')}</div>
                        </div>
                    `;
                }
            }
        }

        // Chỉ hiển thị menu khi nội dung đã sẵn sàng
        menu.classList.add('visible');
        rocketButton.classList.add('active');

        // Chỉ thêm class tạo hiệu ứng xoay khi tùy chọn này được bật
        if (settings?.enableAvatarRotation) {
            rocketButton.classList.add('qr-avatar-rotated');
        }

        // Lớp phủ mờ (Backdrop)
        if (settings?.enableBackdrop && backdrop) {
            backdrop.classList.add('visible');
        }
    } else {
        menu.classList.remove('visible');
        if (sharedState.domElements.backdrop) {
            sharedState.domElements.backdrop.classList.remove('visible');
        }
        rocketButton.classList.remove('active');
        rocketButton.classList.remove('qr-avatar-rotated');
        applyWhitelistDOMChanges();
    }
}

// --- Logic Tooltip tùy chỉnh ---
let tooltipEl = null;

function getTooltipElement() {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'qr-tooltip';
        document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
}

export function showTooltip(e, reply, hideLabel = false) {
    const el = getTooltipElement();
    const targetBtn = e.currentTarget;

    // Phân tích thông tin nguồn gốc
    let sourceText = translate('Nguồn không xác định', 'qra_source_unknown');
    if (reply.source === 'JSSlashRunner') sourceText = translate('Tavern Helper (JSR)', 'qra_source_jsr');
    else if (reply.source === 'QuickReplyV2') sourceText = translate('Phản hồi nhanh (QR)', 'qra_source_qr');
    else if (reply.source === 'LittleWhiteBox') sourceText = translate('LittleWhiteBox (LWB)', 'qra_source_lwb');
    else if (reply.source === 'RawDomElement') sourceText = translate('Tiện ích ST', 'qra_source_thirdparty') || 'Tiện ích ST';

    let scopeText = translate('Nhân vật', 'qra_scope_character');
    if (reply.scope === 'global') scopeText = translate('Toàn cục', 'qra_scope_global');
    else if (reply.scope === 'character') scopeText = translate('Nhân vật', 'qra_scope_character');
    else if (reply.scope === 'preset') scopeText = translate('Cài đặt sẵn', 'qra_scope_preset');

    const setSource = reply.setName || 'Default';
    const displaySource = reply.source === 'LittleWhiteBox' ? 'XB-Task' : setSource;

    let contentHtml = `
        <div style="text-align:left; line-height:1.5;">
            <div style="color:#666; font-size:0.9em;">${translate('Nguồn', 'qra_tooltip_source')}: ${sourceText}</div>
            <div style="color:#666; font-size:0.9em;">${translate('Phạm vi', 'qra_tooltip_scope')}: ${scopeText}</div>
    `;

    // Nếu không ẩn nguồn thuộc về và tiêu đề (trong chế độ menu chính)
    if (!hideLabel) {
        contentHtml += `
            <div style="color:#666; font-size:0.9em;">${translate('Thuộc về', 'qra_tooltip_belong')}: ${displaySource}</div>
            <div style="margin-top:6px; font-weight:600; color:#333; font-size:1.1em; border-top:1px solid #eee; padding-top:4px;">
                ${reply.label}
            </div>
        `;
    }

    contentHtml += `</div>`;
    el.innerHTML = contentHtml;
    el.classList.add('visible');

    const btnRect = targetBtn.getBoundingClientRect();
    const tooltipRect = el.getBoundingClientRect();

    // Cải thiện logic định vị: Kiểm tra xem có đang ở trong bảng cài đặt (khu vực danh sách trắng) hay không
    const isWhitelistItem = targetBtn.classList.contains('qrq-whitelist-item');
    const isLeftColumn = !isWhitelistItem && targetBtn.closest('.column-left') !== null;

    let top = btnRect.bottom;
    let left = 0;

    if (isWhitelistItem) {
        // Các mục trong danh sách trắng: Căn chỉnh thống nhất ở góc dưới bên phải của nút
        left = btnRect.left;
    } else if (isLeftColumn) {
        left = btnRect.left - tooltipRect.width;
    } else {
        left = btnRect.right;
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
}

export function hideTooltip() {
    const el = getTooltipElement();
    el.classList.remove('visible');
}

/**
 * Hiển thị popup hướng dẫn sử dụng biểu tượng tùy chỉnh
 * @param {HTMLElement} menuContainer Khung chứa menu
 */
function showCustomIconGuidance(menuContainer) {
    const existingOverlay = menuContainer.querySelector('.qr-ob-guidance-overlay');
    if (existingOverlay) return;

    const overlay = document.createElement('div');
    overlay.className = 'qr-ob-guidance-overlay';
    overlay.innerHTML = `
        <div class="qr-ob-guidance-box">
            <div class="qr-ob-guidance-title">${translate('Thêm biểu tượng tùy chỉnh', 'qra_onboarding_custom_guide_title')}</div>
            <div class="qr-ob-guidance-text">
                ${translate('Vui lòng nhấp vào biểu tượng Quản lý tiện ích <i class="fa-solid fa-cubes"></i> trên thanh menu của SillyTavern, tìm <strong>【QR Assistant】</strong>, chuyển sang trang <strong>"Nút biểu tượng"</strong> để thêm và kích hoạt biểu tượng tùy chỉnh.', 'qra_onboarding_custom_guide_text')}
            </div>
            <button class="qr-ob-btn" id="qr-ob-guidance-close">${translate('Đã hiểu', 'qra_onboarding_got_it')}</button>
        </div>
    `;
    menuContainer.appendChild(overlay);

    document.getElementById('qr-ob-guidance-close').addEventListener('click', () => {
        overlay.style.transition = 'opacity 0.15s';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 150);
    });
}

/**
 * Hiển thị thanh cài đặt ban đầu (Onboarding Header)
 * @param {HTMLElement} menuContainer Khung chứa menu
 * @param {Object} settings Đối tượng cài đặt
 */
function renderOnboardingHeader(menuContainer, settings) {
    if (document.getElementById(Constants.ID_ONBOARDING_HEADER)) return;

    const header = document.createElement('div');
    header.id = Constants.ID_ONBOARDING_HEADER;

    // Khởi tạo các tùy chọn UI Themes
    const themes = [
        { val: Constants.UI_THEMES.LIGHT, label: translate('Mặc định', 'qra_theme_default') },
        { val: Constants.UI_THEMES.SYSTEM, label: translate('Theo SillyTavern', 'qra_theme_system') },
        { val: Constants.UI_THEMES.CUTE, label: translate('Hoa anh đào', 'qra_theme_sakura') },
        { val: Constants.UI_THEMES.CLASSICAL, label: translate('Cổ điển', 'qra_theme_classical') },
        { val: Constants.UI_THEMES.DARK, label: translate('Tối', 'qra_theme_dark') },
        { val: Constants.UI_THEMES.PAPER, label: translate('Giấy Washi', 'qra_theme_paper') },
        { val: Constants.UI_THEMES.CERAMIC, label: translate('Sứ trắng', 'qra_theme_ceramic') },
        { val: Constants.UI_THEMES.LAVENDER, label: translate('Oải hương', 'qra_theme_lavender') },
        { val: Constants.UI_THEMES.SMOKED, label: translate('Khói mờ', 'qra_theme_smoked') },
        { val: Constants.UI_THEMES.AURORA, label: translate('Cực quang', 'qra_theme_aurora') },
        { val: Constants.UI_THEMES.FOREST, label: translate('Rừng sương mù', 'qra_theme_forest') }
    ];

    let optionsHtml = '';
    themes.forEach(t => {
        const selected = (settings.uiTheme === t.val) ? 'selected' : '';
        optionsHtml += `<option value="${t.val}" ${selected}>${t.label}</option>`;
    });

    const isBlur = settings.enableBackdrop ? 'checked' : '';

    // Xác định nguồn biểu tượng hiện tại
    const currentIconType = settings.iconType || Constants.ICON_TYPES.STAR;
    let currentSource = 'builtin';
    if (currentIconType === Constants.ICON_TYPES.CHARACTER_CARD) currentSource = 'character';
    else if (currentIconType === Constants.ICON_TYPES.CUSTOM) currentSource = 'custom';

    const isActive = (source) => source === currentSource ? 'active' : '';

    header.innerHTML = `
        <div class="qr-ob-group">
            <i class="fa-solid fa-palette" title="${translate('Cài đặt giao diện nhanh', 'qra_onboarding_theme')}"></i>
            <select id="${Constants.ID_ONBOARDING_THEME_SELECT}" class="qr-ob-select">
                ${optionsHtml}
            </select>
        </div>
        <div class="qr-ob-group qr-ob-icon-source">
            <button id="${Constants.ID_ONBOARDING_ICON_SOURCE}" class="qr-ob-icon-btn" title="${translate('Chuyển đổi nguồn biểu tượng', 'qra_onboarding_icon')}">
                <i class="fa-solid fa-icons"></i>
                <span>${translate('Cài đặt biểu tượng', 'qra_onboarding_icon')}</span>
            </button>
            <div id="${Constants.ID_ONBOARDING_ICON_MENU}" class="qr-ob-icon-menu">
                <div class="qr-ob-icon-option ${isActive('character')}" data-source="character">
                    <i class="fa-solid fa-user-circle"></i>
                    <span>${translate('Thẻ nhân vật hiện tại', 'qra_onboarding_char_card')}</span>
                </div>
                <div class="qr-ob-icon-option ${isActive('builtin')}" data-source="builtin">
                    <i class="fa-solid fa-star-and-crescent"></i>
                    <span>${translate('Biểu tượng tích hợp', 'qra_onboarding_builtin')}</span>
                </div>
                <div class="qr-ob-icon-option ${isActive('custom')}" data-source="custom">
                    <i class="fa-solid fa-image"></i>
                    <span>${translate('Biểu tượng tùy chỉnh', 'qra_onboarding_custom')}</span>
                </div>
            </div>
        </div>
        <div class="qr-ob-group">
            <label style="cursor:pointer; display:flex; align-items:center; gap:4px;">
                <input type="checkbox" id="${Constants.ID_ONBOARDING_BLUR_CHECK}" ${isBlur}>
                ${translate('Làm mờ phông nền', 'qra_onboarding_blur')}
            </label>
        </div>
        <button id="${Constants.ID_ONBOARDING_BTN_DONE}" class="qr-ob-btn">
            ${translate('Hoàn tất thiết lập', 'qra_onboarding_done')}
        </button>
    `;

    // Chèn vào trên cùng của menu
    menuContainer.insertBefore(header, menuContainer.firstChild);

    // --- Liên kết sự kiện tương tác ---

    // 1. Xem trước Theme theo thời gian thực
    const themeSelect = document.getElementById(Constants.ID_ONBOARDING_THEME_SELECT);
    themeSelect.addEventListener('change', (e) => {
        settings.uiTheme = e.target.value;
        applyThemeStyles(); // Áp dụng ngay biến CSS, cho phép xem trước mà không cần lưu
        // Đồng thời đồng bộ hộp chọn trong bảng cài đặt (nếu có)
        const settingDd = document.getElementById(Constants.ID_UI_THEME_DROPDOWN);
        if (settingDd) settingDd.value = settings.uiTheme;
    });

    // 1.5 Chuyển đổi nguồn biểu tượng
    const iconSourceBtn = document.getElementById(Constants.ID_ONBOARDING_ICON_SOURCE);
    const iconMenu = document.getElementById(Constants.ID_ONBOARDING_ICON_MENU);

    // Ẩn/hiện menu thả xuống
    iconSourceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        iconMenu.classList.toggle('open');
    });

    // Sự kiện nhấp chuột cho từng tùy chọn
    iconMenu.querySelectorAll('.qr-ob-icon-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const source = option.dataset.source;
            iconMenu.classList.remove('open');

            if (source === 'custom') {
                showCustomIconGuidance(menuContainer);
                return;
            }

            // Lưu ảnh chụp nhanh trạng thái biểu tượng tích hợp hiện tại trước khi chuyển đổi
            if (settings.iconType !== Constants.ICON_TYPES.CUSTOM && settings.iconType !== Constants.ICON_TYPES.CHARACTER_CARD) {
                settings._builtinIconType = settings.iconType;
            }

            if (source === 'character') {
                settings.iconType = Constants.ICON_TYPES.CHARACTER_CARD;
            } else {
                settings.iconType = settings._builtinIconType || Constants.ICON_TYPES.STAR;
            }

            saveSettings();
            updateIconDisplay();

            // Cập nhật trạng thái đang chọn trong menu
            iconMenu.querySelectorAll('.qr-ob-icon-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Nhấp ra ngoài menu để đóng menu thả xuống
    menuContainer.addEventListener('click', (e) => {
        if (!iconSourceBtn.contains(e.target) && !iconMenu.contains(e.target)) {
            iconMenu.classList.remove('open');
        }
    });

    // 2. Xem trước tính năng Làm mờ (Blur) theo thời gian thực
    const blurCheck = document.getElementById(Constants.ID_ONBOARDING_BLUR_CHECK);
    blurCheck.addEventListener('change', (e) => {
        settings.enableBackdrop = e.target.checked;
        // Kiểm soát hiện/ẩn backdrop theo thời gian thực
        const backdrop = sharedState.domElements.backdrop;
        if (backdrop) {
            if (settings.enableBackdrop) backdrop.classList.add('visible');
            else backdrop.classList.remove('visible');
        }
        // Đồng bộ với bảng cài đặt
        const settingCheck = document.getElementById(Constants.ID_BACKDROP_ENABLED_CHECKBOX);
        if (settingCheck) settingCheck.checked = settings.enableBackdrop;
    });

    // 3. Nút Hoàn tất
    const btnDone = document.getElementById(Constants.ID_ONBOARDING_BTN_DONE);
    btnDone.addEventListener('click', () => {
        // Đánh dấu là đã hoàn thành
        settings.firstTimeSetupPending = false;
        saveSettings(); // Lưu kết quả cuối cùng

        // Xóa hoạt ảnh của Header
        header.style.transition = 'opacity 0.2s';
        header.style.opacity = '0';
        setTimeout(() => {
            header.remove();
            // Tính toán lại vị trí và chiều cao bố cục một lần do chiều cao đã thay đổi khi bỏ phần đầu
            updateMenuVisibilityUI();
        }, 200);
    });
}

/**
 * Thực thi logic phân nhóm tự động, sắp xếp và cân bằng (Phiên bản hoàn hảo cuối cùng)
 * Các tính năng:
 * 1. Làm sạch trước theo danh sách trắng: Lọc bỏ các nút bị ẩn trước khi tính toán để tránh chiều cao ma (ghost height) can thiệp.
 * 2. Lấp hố thông minh (Best Fit): Tính một nửa chênh lệch chiều cao, tìm nhóm có kích thước gần nhất để di chuyển, xử lý chính xác sự khác biệt 2 vs 3.
 * 3. Sắp xếp lại dạng Kim Tự Tháp: Sắp xếp lại toàn cục sau khi chuyển để đảm bảo cho dù di chuyển thế nào thì cấu trúc "trên nhỏ dưới to" luôn được duy trì.
 */
function performAutoGrouping(leftRaw, rightRaw) {
    // --- A. Chuẩn bị: Lấy các cài đặt ---
    const context = window.SillyTavern?.getContext();
    const settings = context?.extensionSettings?.["qr-assistant"] || {};
    const whitelist = Array.isArray(settings.whitelist) ? settings.whitelist : [];

    // Trình tạo ID
    const generateId = (item) => {
        if (item.source === 'JSSlashRunner') return `JSR::${item.scriptId}`;
        if (item.source === 'QuickReplyV2') return `QRV2::${item.setName}`;
        if (item.source === 'LittleWhiteBox') {
            if (item.taskScope === 'character') return 'LWB::Character_Set';
            return `LWB::${item.taskScope}::${item.taskId}`;
        }
        if (item.source === 'RawDomElement') return item.domId;
        return null;
    };

    const isVisible = (item) => {
        const id = generateId(item);
        if (id && whitelist.includes(id)) return false;
        return true;
    };

    // --- B. Phân nhóm (Đồng thời thực hiện bộ lọc) ---
    const groupItems = (items) => {
        const map = new Map();
        if (Array.isArray(items)) {
            items.forEach(item => {
                if (!isVisible(item)) return;
                const key = item.setName || 'Unknown';
                if (!map.has(key)) {
                    map.set(key, { name: key, items: [], count: 0 });
                }
                const g = map.get(key);
                g.items.push(item);
                g.count++;
            });
        }
        return Array.from(map.values());
    };

    let leftGroups = groupItems(leftRaw);
    let rightGroups = groupItems(rightRaw);
    const flatten = (groups) => groups.flatMap(g => g.items);

    // ==========================================
    // Chế độ 1: Sắp xếp tùy chỉnh (Chế độ đường ray đôi - Thủ công)
    // ==========================================
    if (settings.enableCustomSort && settings.groupOrder) {
        // 1. Đưa nhóm còn hoạt động hiện tại vào Map để tiện lợi trong việc xuất dữ liệu
        const activeGroupsMap = new Map();
        [...leftGroups, ...rightGroups].forEach(g => activeGroupsMap.set(g.name, g));

        const finalLeftGroups = [];
        const finalRightGroups = [];

        // 2. Đối phó với việc thu nhỏ số lượng: Chiết xuất cột trái theo bản thiết kế (Nếu gặp nhóm "ma" thì bỏ qua)
        (settings.groupOrder.left || []).forEach(name => {
            if (activeGroupsMap.has(name)) {
                finalLeftGroups.push(activeGroupsMap.get(name));
                activeGroupsMap.delete(name);
            }
        });

        // 3. Đối phó với việc thu nhỏ số lượng: Chiết xuất cột phải theo bản thiết kế
        (settings.groupOrder.right || []).forEach(name => {
            if (activeGroupsMap.has(name)) {
                finalRightGroups.push(activeGroupsMap.get(name));
                activeGroupsMap.delete(name);
            }
        });

        // 4. Đối phó với số lượng gia tăng: Bố trí lại các nhóm mồ côi (không nằm trong bản thiết kế)
        activeGroupsMap.forEach((group, name) => {
            const isOriginallyLeft = leftGroups.some(g => g.name === name);
            if (isOriginallyLeft) finalLeftGroups.push(group);
            else finalRightGroups.push(group);
        });

        return {
            leftList: flatten(finalLeftGroups),
            rightList: flatten(finalRightGroups)
        };
    }

    // ==========================================
    // Chế độ 2: Cân bằng thích ứng và sắp xếp kim tự tháp (Chế độ đường ray đôi - Tự động)
    // ==========================================
    const sorter = (a, b) => {
        if (a.count !== b.count) return a.count - b.count;
        return a.name.localeCompare(b.name, 'zh-CN');
    };

    leftGroups.sort(sorter);
    rightGroups.sort(sorter);

    const getHeight = (list) => list.reduce((sum, g) => sum + g.count, 0);
    let maxLoop = 20;

    while (maxLoop > 0) {
        maxLoop--;
        const lH = getHeight(leftGroups);
        const rH = getHeight(rightGroups);
        const diff = lH - rH;

        if (Math.abs(diff) <= 1) break;

        const targetMoveSize = Math.abs(diff) / 2;
        const sourceList = diff > 0 ? leftGroups : rightGroups;
        const targetList = diff > 0 ? rightGroups : leftGroups;

        let bestIndex = -1;
        let minDist = Infinity;

        sourceList.forEach((group, index) => {
            const dist = Math.abs(group.count - targetMoveSize);
            if (dist < minDist) {
                minDist = dist;
                bestIndex = index;
            }
        });

        if (bestIndex === -1) break;

        const candidateSize = sourceList[bestIndex].count;
        const currentImbalance = Math.abs(diff);
        const newImbalance = Math.abs((lH - (diff > 0 ? candidateSize : -candidateSize)) - (rH + (diff > 0 ? candidateSize : -candidateSize)));

        if (newImbalance >= currentImbalance) break;

        const groupToMove = sourceList.splice(bestIndex, 1)[0];
        targetList.push(groupToMove);
    }

    leftGroups.sort(sorter);
    rightGroups.sort(sorter);

    return {
        leftList: flatten(leftGroups),
        rightList: flatten(rightGroups)
    };
}
