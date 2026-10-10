// settings.js
import * as Constants from './constants.js';
import { sharedState } from './state.js';
import { fetchQuickReplies } from './api.js';
import { applyWhitelistDOMChanges } from './whitelist.js';
import { attachScrollListener, showTooltip, hideTooltip } from './ui.js';
import { checkForUpdates, getChangelog, performUpdate } from './update.js';
import { Logger, LogLevel, LogCategory } from './logger.js';
import { translate, getCurrentLocale } from '../../../i18n.js';
import { helpDocs, announcementDocs } from './dict.js';

// Đồng bộ trạng thái công tắc "Gộp nút" (Combined buttons) của Quick Reply v2 gốc vào bảng điều khiển của chúng ta
export function syncCombinedCheckbox() {
    const combinedCheck = document.getElementById(Constants.ID_COMBINED_BUTTONS_CHECKBOX);
    if (combinedCheck && window.quickReplyApi && window.quickReplyApi.settings) {
        combinedCheck.checked = window.quickReplyApi.settings.isCombined;
    }
}

// --- Logic chèn CSS tự động thu gọn ---
function injectAutoShrinkStyle() {
    if (document.getElementById(Constants.ID_AUTO_SHRINK_STYLE_TAG)) return;
    const style = document.createElement('style');
    style.id = Constants.ID_AUTO_SHRINK_STYLE_TAG;
    style.innerHTML = `
        #qr--bar {
            height: 0px;
            overflow: hidden;
            transition: height 0.3s ease-in-out;
        }
        #send_form:hover #qr--bar {
            height: var(--buttons-bar-height); 
        }
    `;
    document.head.appendChild(style);
}

function removeAutoShrinkStyle() {
    const style = document.getElementById(Constants.ID_AUTO_SHRINK_STYLE_TAG);
    if (style) style.remove();
}

// Xuất hàm định vị thanh trượt, để index.js gọi khi mở bảng điều khiển
export function updateTabGliderState() {
    const tabBar = document.getElementById(Constants.ID_SETTINGS_TAB_BAR);
    const activeTab = tabBar?.querySelector('.qr-settings-tab-item.active');
    const glider = tabBar?.querySelector('.qr-tab-glider');

    // Chỉ tính toán khi Tab tồn tại và hiển thị (chiều rộng > 0), tránh việc khởi tạo bị ẩn tính bằng 0
    if (activeTab && glider && activeTab.offsetWidth > 0) {
        glider.style.width = `${activeTab.offsetWidth}px`;
        glider.style.transform = `translateX(${activeTab.offsetLeft}px)`;
        glider.style.opacity = '1';
    }
}

// settings.js -> updateIconDisplay
export function updateIconDisplay() {
    const button = sharedState.domElements.rocketButton;
    if (!button) return;

    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const iconType = settings.iconType || Constants.ICON_TYPES.STAR;
    const customIconUrl = settings.customIconUrl || '';
    const faIconCode = settings.faIconCode || '';
    const sizeMode = settings.builtinIconSize || 'match'; // Chế độ kích thước biểu tượng tích hợp

    // 1. Dọn dẹp kiểu cũ
    button.innerHTML = '';
    button.removeAttribute('style');
    button.className = '';

    // 2. Thích ứng tên lớp cơ sở
    const sendBtn = document.getElementById('send_but');
    if (sendBtn && sendBtn.classList.contains('primary-button')) button.classList.add('primary-button');
    else button.classList.add('secondary-button');

    // 3. Hiển thị nội dung biểu tượng
    let myIconElement = null;

    if (iconType === Constants.ICON_TYPES.CUSTOM && customIconUrl) {
        const img = document.createElement('img');
        img.src = customIconUrl;
        img.alt = "icon";

        // Tìm cấu hình tương ứng với biểu tượng hiện tại để lấy:
        const savedCustomIcons = settings.savedCustomIcons || [];
        const currentIconConfig = savedCustomIcons.find(icon => icon.url === customIconUrl);
        // Nếu tìm thấy cấu hình và có trường size thì sử dụng, nếu không mặc định 1.2
        const iconSize = (currentIconConfig && currentIconConfig.size) ? currentIconConfig.size : '1.2';

        // Luôn sử dụng đơn vị tương đối em, để nó tự thích ứng theo cỡ chữ của nút
        img.style.height = iconSize + 'em';
        img.style.width = 'auto';
        img.style.verticalAlign = 'middle';
        img.style.display = 'inline-block';
        img.style.objectFit = 'contain';

        button.appendChild(img);
        myIconElement = img;

    } else if (iconType === Constants.ICON_TYPES.CHARACTER_CARD) {
        const avatarImg = document.querySelector("#avatar_load_preview");
        if (avatarImg && avatarImg.src) {
            const img = document.createElement('img');
            img.src = avatarImg.src;
            img.alt = "character";
            img.className = 'qr-character-avatar';
            img.onerror = () => { button.innerHTML = '<i class="fa-solid fa-user"></i>'; };
            button.appendChild(img);
            myIconElement = img;
        } else {
            button.innerHTML = '<i class="fa-solid fa-user"></i>';
            myIconElement = button.querySelector('i');
        }

    } else if (iconType === Constants.ICON_TYPES.FONTAWESOME && faIconCode) {
        button.innerHTML = faIconCode;
        myIconElement = button.querySelector('i, svg');
    } else {
        const iconClass = Constants.ICON_CLASS_MAP[iconType] || Constants.ICON_CLASS_MAP[Constants.ICON_TYPES.STAR];

        // Tính toán cỡ chữ cuối cùng
        let finalFontSize;
        if (sizeMode === 'match') {
            finalFontSize = 'inherit'; // Giữ nguyên cùng với nút gửi
        } else {
            const numVal = parseFloat(sizeMode);
            if (!isNaN(numVal) && numVal > 0) {
                finalFontSize = `${sizeMode}em`;
            } else {
                finalFontSize = 'inherit'; // Giá trị không hợp lệ, dự phòng
            }
        }

        button.innerHTML = `<i class="fa-solid ${iconClass}" style="font-size: ${finalFontSize};"></i>`;
        myIconElement = button.querySelector('i');
    }

    // 4. Đồng bộ kiểu sâu (Hoàn toàn tự thích ứng)
    if (sendBtn) {
        const sendBtnComputed = window.getComputedStyle(sendBtn);

        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.color = sendBtnComputed.color;
        button.style.cursor = sendBtnComputed.cursor;
        button.style.fontSize = sendBtnComputed.fontSize; // Đồng bộ cỡ chữ gốc

        const innerIcon = sendBtn.querySelector('i');
        const sourceElement = innerIcon || sendBtn;
        const sourceComputed = window.getComputedStyle(sourceElement);

        if (myIconElement) {
            myIconElement.style.paddingTop = sourceComputed.paddingTop;
            myIconElement.style.paddingBottom = sourceComputed.paddingBottom;
            myIconElement.style.marginTop = sourceComputed.marginTop;

            // Chỉ trong chế độ "Giữ nguyên cùng nút gửi" thì mới đồng bộ cỡ chữ; chế độ tùy chỉnh thì không ghi đè
            if (sizeMode === 'match' && sourceComputed.fontSize !== sendBtnComputed.fontSize) {
                 myIconElement.style.fontSize = sourceComputed.fontSize;
                 button.style.fontSize = 'inherit';
            }
        }
    }
}

// HTML Bảng Cài đặt
export function createSettingsHtml() {
    return `
    <div id="${Constants.ID_SETTINGS_CONTAINER}" class="extension-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <div style="display:flex; align-items:center;">
                    <b data-i18n="qra_plugin_name">QR Assistant</b>
                    <span id="${Constants.ID_NEW_VERSION_BADGE}" class="qr-new-badge">NEW</span>
                </div>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
            </div>
            <div class="inline-drawer-content">

                <!-- Thanh Menu -->
                <div id="${Constants.ID_SETTINGS_TAB_BAR}" class="qr-settings-tab-bar" style="gap: 2px;">
                    <!-- Phần tử con chạy (Slider) -->
                    <div class="qr-tab-glider"></div>

                    <div class="qr-settings-tab-item active" data-tab="${Constants.ID_PAGE_MAIN}" id="${Constants.ID_TAB_MAIN}" style="padding: 10px 4px; font-size: 0.85em; letter-spacing: -0.2px;">
                        <i class="fa-solid fa-cog"></i> <span data-i18n="qra_tab_main">Cài đặt chính</span>
                    </div>
                    <div class="qr-settings-tab-item" data-tab="${Constants.ID_PAGE_WHITELIST}" id="${Constants.ID_TAB_WHITELIST}" style="padding: 10px 4px; font-size: 0.85em; letter-spacing: -0.2px;">
                        <i class="fa-solid fa-list-check"></i> <span data-i18n="qra_tab_whitelist">Danh sách trắng</span>
                    </div>
                    <div class="qr-settings-tab-item" data-tab="${Constants.ID_PAGE_ICON}" id="${Constants.ID_TAB_ICON}" style="padding: 10px 4px; font-size: 0.85em; letter-spacing: -0.2px;">
                        <i class="fa-solid fa-icons"></i> <span data-i18n="qra_tab_icon">Biểu tượng nút</span>
                    </div>
                </div>

                <!-- 1. Trang Cài đặt chính -->
                <div id="${Constants.ID_PAGE_MAIN}" class="qr-settings-page active">
                    <!-- Dòng kiểm tra phiên bản -->
                    <div class="qr-version-row">
                        <span><span data-i18n="qra_label_current_version">Phiên bản hiện tại:</span> <span id="${Constants.ID_VERSION_DISPLAY}">...</span></span>
                        <button id="${Constants.ID_BTN_CHECK_UPDATE}" class="menu_button qr-update-btn"><span data-i18n="qra_btn_check_update">Kiểm tra cập nhật</span></button>
                    </div>

                    <div class="flex-container flexGap5">
                        <select id="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}" class="text_pole" style="width: 100%;">
                            <option value="true" data-i18n="qra_opt_enable">Bật tiện ích</option>
                            <option value="false" data-i18n="qra_opt_disable">Tắt tiện ích</option>
                        </select>
                    </div>

                    <!-- Cài đặt chủ đề UI -->
                    <div class="flex-container flexGap5" style="margin-top: 10px; align-items: center;">
                        <label style="font-weight:bold; min-width: 70px;" data-i18n="qra_label_ui_theme">Chủ đề UI:</label>
                        <select id="${Constants.ID_UI_THEME_DROPDOWN}" class="text_pole" style="flex:1;">
                            <option value="${Constants.UI_THEMES.LIGHT}" data-i18n="qra_theme_default">Mặc định</option>
                            <option value="${Constants.UI_THEMES.SYSTEM}" data-i18n="qra_theme_system">Theo SillyTavern</option>
                            <option value="${Constants.UI_THEMES.CUTE}" data-i18n="qra_theme_sakura">Hoa anh đào</option>
                            <option value="${Constants.UI_THEMES.CLASSICAL}" data-i18n="qra_theme_classical">Cổ điển</option>
                            <option value="${Constants.UI_THEMES.DARK}" data-i18n="qra_theme_dark">Tối</option>
                            <option value="${Constants.UI_THEMES.PAPER}" data-i18n="qra_theme_paper">Giấy Washi</option>
                            <option value="${Constants.UI_THEMES.CERAMIC}" data-i18n="qra_theme_ceramic">Sứ trắng</option>
                            <option value="${Constants.UI_THEMES.LAVENDER}" data-i18n="qra_theme_lavender">Oải hương</option>
                            <option value="${Constants.UI_THEMES.SMOKED}" data-i18n="qra_theme_smoked">Khói</option>
                            <option value="${Constants.UI_THEMES.AURORA}" data-i18n="qra_theme_aurora">Cực quang</option>
                            <option value="${Constants.UI_THEMES.FOREST}" data-i18n="qra_theme_forest">Rừng sương mù</option>
                        </select>
                    </div>

                    <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 2px;">

                        <!-- Thẻ Tự động thu gọn -->
                        <div class="qr-setting-card">
                            <div class="qr-setting-text">
                                <h3 style="display: flex; align-items: center; gap: 5px;">
                                    <span data-i18n="qra_card_autoshrink_title">Tự động thu gọn nút</span>
                                    <i class="fa-solid fa-circle-question qr-setting-help-icon" data-help="autoshrink" style="cursor: pointer; color: #999; font-size: 14px;" data-i18n="[title]qra_help_tooltip" title="Xem giải thích chi tiết"></i>
                                </h3>
                                <p data-i18n="qra_card_autoshrink_desc">Tự động thu gọn khu vực nút phía trên hộp nhập liệu chat</p>
                            </div>
                            <label class="qr-toggle">
                                <input type="checkbox" id="${Constants.ID_AUTO_SHRINK_CHECKBOX}">
                                <span class="qr-slider"></span>
                            </label>
                        </div>

                        <!-- Thẻ Làm mờ nền -->
                        <div class="qr-setting-card">
                            <div class="qr-setting-text">
                                <h3 style="display: flex; align-items: center; gap: 5px;">
                                    <span data-i18n="qra_card_backdrop_title">Hiệu ứng làm mờ nền</span>
                                    <i class="fa-solid fa-circle-question qr-setting-help-icon" data-help="backdrop" style="cursor: pointer; color: #999; font-size: 14px;" data-i18n="[title]qra_help_tooltip" title="Xem giải thích chi tiết"></i>
                                </h3>
                                <p data-i18n="qra_card_backdrop_desc">Áp dụng hiệu ứng làm mờ nền khi mở menu</p>
                            </div>
                            <label class="qr-toggle">
                                <input type="checkbox" id="${Constants.ID_BACKDROP_ENABLED_CHECKBOX}">
                                <span class="qr-slider"></span>
                            </label>
                        </div>

                        <!-- Thẻ Gộp nút -->
                        <div class="qr-setting-card">
                            <div class="qr-setting-text">
                                <h3 style="display: flex; align-items: center; gap: 5px;">
                                    <span data-i18n="qra_card_combined_title">Gộp Phản hồi nhanh</span>
                                    <i class="fa-solid fa-circle-question qr-setting-help-icon" data-help="combined" style="cursor: pointer; color: #999; font-size: 14px;" data-i18n="[title]qra_help_tooltip" title="Xem giải thích chi tiết"></i>
                                </h3>
                                <p data-i18n="qra_card_combined_desc">Làm cho tất cả các nút phía trên hộp nhập liệu dính liền vào nhau</p>
                            </div>
                            <label class="qr-toggle">
                                <input type="checkbox" id="${Constants.ID_COMBINED_BUTTONS_CHECKBOX}">
                                <span class="qr-slider"></span>
                            </label>
                        </div>

                        <!-- Thẻ Sắp xếp menu -->
                        <div class="qr-setting-card">
                            <div class="qr-setting-text">
                                <h3 style="display: flex; align-items: center; gap: 5px;">
                                    <span data-i18n="qra_card_sort_title">Sắp xếp nút trên menu</span>
                                    <i class="fa-solid fa-circle-question qr-setting-help-icon" data-help="sort" style="cursor: pointer; color: #999; font-size: 14px;" data-i18n="[title]qra_help_tooltip" title="Xem giải thích chi tiết"></i>
                                </h3>
                                <p data-i18n="qra_card_sort_desc">Cho phép tùy chỉnh sắp xếp thứ tự các nút trên menu</p>
                            </div>
                            <button id="${Constants.ID_BTN_OPEN_SORT}" class="qr-card-btn" data-i18n="qra_btn_settings">
                                Cài đặt
                            </button>
                        </div>

                        <!-- Thẻ Hướng dẫn sử dụng -->
                        <div class="qr-setting-card">
                            <div class="qr-setting-text">
                                <h3 data-i18n="qra_card_help_title">Hướng dẫn sử dụng tiện ích</h3>
                                <p data-i18n="qra_card_help_desc">Xem chi tiết tính năng và trợ giúp về tiện ích này</p>
                            </div>
                            <button id="${Constants.ID_BTN_OPEN_HELP}" class="qr-card-btn" data-i18n="qra_btn_open">
                                Mở
                            </button>
                        </div>

                        ${Constants.DEBUG_MODE ? `
                        <!-- Thẻ Nhật ký hệ thống (Chỉ hiển thị khi bật DEBUG_MODE) -->
                        <div class="qr-setting-card" style="align-items: flex-start;">
                            <div class="qr-setting-text" style="padding-top: 5px;">
                                <h3 data-i18n="qra_card_log_title">Nhật ký hệ thống</h3>
                                <p data-i18n="qra_card_log_desc">Xem trạng thái hoạt động, khắc phục sự cố hoặc tải báo cáo nhật ký</p>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 5px; min-width: 140px;">
                                <select id="qr-log-level-select" class="text_pole" style="width: 100%;">
                                    <option value="0" data-i18n="qra_log_level_debug">DEBUG (Tất cả)</option>
                                    <option value="1" data-i18n="qra_log_level_info">INFO (Thông thường)</option>
                                    <option value="2" data-i18n="qra_log_level_warn">WARN (Chỉ cảnh báo)</option>
                                    <option value="3" data-i18n="qra_log_level_error">ERROR (Chỉ lỗi)</option>
                                </select>
                                <button id="qr-view-logs-btn" class="menu_button" style="width: auto; align-self: stretch;" data-i18n="qra_btn_view_logs">Xem nhật ký</button>
                                <button id="qr-download-logs-panel-btn" class="menu_button" style="width: auto; align-self: stretch;" data-i18n="qra_btn_download_logs">Tải nhật ký</button>
                            </div>
                        </div>
                        ` : ''}

                    </div>
                </div>

                <!-- 2. Trang Quản lý Danh sách trắng (Nhúng) -->
                <div id="${Constants.ID_PAGE_WHITELIST}" class="qr-settings-page">
                    <div class="qr-whitelist-inline-container">
                        <div class="qr-whitelist-col">
                            <label data-i18n="qra_whitelist_hidden">Danh sách thu gọn (Ẩn)</label>
                            <div id="qrq-non-whitelisted-list" class="qrq-whitelist-list"></div>
                        </div>
                        <div class="qr-whitelist-col">
                            <label data-i18n="qra_whitelist_visible">Danh sách trắng (Hiển thị)</label>
                            <div id="qrq-whitelisted-list" class="qrq-whitelist-list"></div>
                        </div>
                    </div>

                    <!-- Khu vực giải thích dưới cùng -->
                    <div id="${Constants.ID_WHITELIST_HELP_BOX}" class="qr-whitelist-help-box">
                        <p data-i18n="qra_whitelist_help_p1"><strong>Nhấn trực tiếp vào một tùy chọn trong danh sách trên để chuyển nút tương ứng sang danh sách bên kia.</strong></p>
                        <p data-i18n="qra_whitelist_help_p2"><strong>Các nút trong Danh sách trắng sẽ được hiển thị cố định phía trên hộp nhập liệu và sẽ KHÔNG hiển thị trong menu của QR Assistant. Ngược lại, các nút trong Danh sách thu gọn sẽ hiển thị trong menu và KHÔNG hiển thị trên hộp nhập liệu.</strong></p>
                        <p data-i18n="qra_whitelist_help_p3">Người dùng điện thoại có thể nhấn giữ vào tùy chọn để xem chi tiết nguồn và phạm vi hoạt động của nút.</p>
                        <p data-i18n="qra_whitelist_help_p4">Ngoài ra, <i class="fa-solid fa-sun"></i> là script LittleWhiteBox, <i class="fa-solid fa-star"></i> là Quick Reply, <i class="fa-solid fa-moon"></i> là script Tavern Helper, và <i class="fa-solid fa-puzzle-piece"></i> là tiện ích bên thứ 3.</p>
                    </div>
                </div>

                <!-- 3. Trang Cài đặt Biểu tượng -->
                <div id="${Constants.ID_PAGE_ICON}" class="qr-settings-page">
                    <!-- Lưu ý: Lớp mờ của popup đã được dời đến root của body -->

                    <div class="qr-icon-settings-layout">
                        <!-- Thanh chuyển đổi trên cùng -->
                        <div class="qr-icon-top-bar">
                            <select id="${Constants.ID_ICON_SOURCE_SELECT}" class="text_pole" style="flex:1;">
                                <option value="builtin" data-i18n="qra_icon_source_builtin">Biểu tượng tích hợp</option>
                                <option value="character" data-i18n="qra_icon_source_character">Thẻ nhân vật hiện tại</option>
                                <option value="custom" data-i18n="qra_icon_source_custom">Biểu tượng tùy chỉnh</option>
                            </select>
                        </div>

                        <!-- Khu vực hiển thị nội dung -->
                        <div class="qr-icon-content">

                            <!-- A. Bảng Biểu tượng tích hợp -->
                            <div id="${Constants.ID_PANEL_BUILTIN}" class="qr-icon-panel active">
                                <!-- Đổi chiều thành hàng ngang (row), thêm căn giữa dọc -->
                                <div style="display:flex; flex-direction:row; gap:5px; align-items:center;">
									<label style="font-weight:bold; min-width: 70px;" data-i18n="qra_label_btn_icon">Biểu tượng:</label>
                                    <select id="${Constants.ID_BUILTIN_DROPDOWN}" class="text_pole" style="flex:1;">
                                        <option value="${Constants.ICON_TYPES.ROCKET}" data-i18n="qra_icon_rocket">Tên lửa</option>
                                        <option value="${Constants.ICON_TYPES.BOLT}" data-i18n="qra_icon_bolt">Ngôi sao 6 cánh</option>
                                        <option value="${Constants.ICON_TYPES.COMMENT}" data-i18n="qra_icon_comment">Bảng màu</option>
                                        <option value="${Constants.ICON_TYPES.STAR}" data-i18n="qra_icon_star">Sao & Trăng khuyết</option>
                                        <option value="${Constants.ICON_TYPES.FAN}" data-i18n="qra_icon_fan">Chong chóng</option>
                                        <option value="${Constants.ICON_TYPES.PENCIL}" data-i18n="qra_icon_pencil">Cây bút chì</option>
                                        <option value="${Constants.ICON_TYPES.BOOK}" data-i18n="qra_icon_book">Quyển sách</option>
                                        <option value="${Constants.ICON_TYPES.MUG}" data-i18n="qra_icon_mug">Cốc cà phê</option>
                                        <option value="${Constants.ICON_TYPES.CROWN}" data-i18n="qra_icon_crown">Vương miện</option>
                                        <option value="${Constants.ICON_TYPES.GEM}" data-i18n="qra_icon_gem">Kim cương</option>
                                        <option value="${Constants.ICON_TYPES.HEADPHONES}" data-i18n="qra_icon_headphones">Tai nghe</option>
                                    </select>
                                </div>
                                <div class="qr-icon-preview-box" id="${Constants.ID_BUILTIN_PREVIEW}">
                                    <!-- JS Điền -->
                                    <i class="fa-solid fa-star-and-crescent"></i>
                                    <span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>
                                </div>
                                <!-- Điều khiển kích thước biểu tượng -->
                                <div style="display:flex; flex-direction:column; gap:5px;">
                                    <div style="display:flex; flex-direction:row; gap:5px; align-items:center;">
                                        <label style="font-weight:bold; min-width: 70px;" data-i18n="qra_label_icon_size">Kích thước:</label>
                                        <select id="${Constants.ID_BUILTIN_SIZE_SELECT}" class="text_pole" style="flex:1;">
                                            <option value="match" data-i18n="qra_opt_size_match">Khớp với nút Gửi</option>
                                            <option value="custom" data-i18n="qra_opt_size_custom">Tùy chỉnh kích thước</option>
                                        </select>
                                    </div>
                                    <div id="${Constants.ID_BUILTIN_SIZE_INPUT}-wrapper" style="display:none; flex-direction:row; gap:5px; align-items:center;">
                                        <label style="font-weight:bold; min-width: 70px;" data-i18n="qra_label_size_em">Cỡ (em):</label>
                                        <input type="number" id="${Constants.ID_BUILTIN_SIZE_INPUT}" class="text_pole" style="flex:1;" step="0.1" min="0.1" placeholder="Ví dụ: 1.5">
                                    </div>
                                </div>
                            </div>

                            <!-- A2. Bảng Thẻ nhân vật hiện tại -->
                            <div id="${Constants.ID_PANEL_CHARACTER}" class="qr-icon-panel">
                                <p style="text-align:center; opacity:0.6; font-size:13px; margin:0;" data-i18n="qra_char_desc">Sử dụng ảnh đại diện của nhân vật hiện tại làm biểu tượng, tự động cập nhật khi chuyển chat</p>
                                <div class="qr-icon-preview-box" id="${Constants.ID_PANEL_CHARACTER}-preview">
                                    <span data-i18n="qra_char_no_avatar">Không có ảnh</span>
                                    <span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>
                                </div>
                                <!-- Công tắc bật/tắt hoạt ảnh xoay ảnh đại diện -->
                                <div style="margin-top: 15px; border-top: 1px solid var(--SmartThemeBorderColor, rgba(255,255,255,0.1)); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px;" data-i18n="qra_char_avatar_rotation">Bật hoạt ảnh xoay ảnh đại diện</span>
                                    <label class="qr-toggle">
                                        <input type="checkbox" id="qr-toggle-avatar-rotation">
                                        <span class="qr-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <!-- B. Bảng Biểu tượng tùy chỉnh -->
                            <div id="${Constants.ID_PANEL_CUSTOM}" class="qr-icon-panel">
                                <!-- Đổi chiều thành hàng ngang (row), thêm căn giữa dọc -->
                                <div style="display:flex; flex-direction:row; gap:5px; align-items:center;">
                                <label style="font-weight:bold; min-width: 70px;" data-i18n="qra_label_btn_icon">Biểu tượng:</label>
                                    <select id="${Constants.ID_CUSTOM_DROPDOWN}" class="text_pole" style="flex:1;">
                                        <option value="" data-i18n="qra_custom_placeholder">-- Chọn hoặc Thêm mới --</option>
                                    </select>
                                </div>

                                <div class="qr-icon-preview-box" id="${Constants.ID_CUSTOM_PREVIEW}">
                                    <span data-i18n="qra_custom_no_icon">Không có</span>
                                    <span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>
                                </div>

                                <div class="qr-icon-actions">
                                    <button id="${Constants.ID_BTN_MANAGE_CUSTOM}" class="menu_button">
                                        <i class="fa-solid fa-list"></i> <span data-i18n="qra_btn_manage_icons">Quản lý</span>
                                    </button>
                                    <button id="${Constants.ID_BTN_ADD_CUSTOM}" class="menu_button">
                                        <i class="fa-solid fa-plus"></i> <span data-i18n="qra_btn_add_icon">Thêm mới</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>`;
}

// --- Trình tạo HTML cho Popup ---
function createManageModalHtml(savedIcons) {
    let listHtml = '';
    if (savedIcons && savedIcons.length > 0) {
        savedIcons.forEach((icon, index) => {
            // Lấy kích thước, nếu không có thì mặc định hiển thị 1.2
            const sizeDisplay = icon.size || '1.2';

            listHtml += `
            <div class="qr-manage-item" data-index="${index}">
                <!-- Xem trước biểu tượng -->
                <img src="${icon.url}" onerror="this.src=''">

                <!-- Khu vực tên và chi tiết -->
                <div style="flex:1; overflow:hidden; display:flex; flex-direction:column; justify-content:center;">
                    <span class="qr-manage-name" title="${icon.name}" style="font-weight:bold; font-size:14px;">${icon.name}</span>
                </div>

                <!-- Nút thao tác -->
                <div class="qr-manage-actions">
                    <!-- Sửa lại để gọi editIcon -->
                    <button class="qr-icon-btn edit" title="${translate('Sửa', 'qra_title_edit')}" onclick="window.quickReplyMenu.editIcon(${index})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="qr-icon-btn delete" title="${translate('Xóa', 'qra_title_delete')}" onclick="window.quickReplyMenu.deleteIcon(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>`;
        });
    } else {
        listHtml = `<div style="text-align:center; padding:20px; color:#888;" data-i18n="qra_no_saved_icons">Không có biểu tượng nào được lưu</div>`;
    }

    return `
    <div class="qr-modal-box" id="${Constants.ID_MODAL_MANAGE}">
        <div class="qr-modal-header" data-i18n="qra_modal_manage_title">Quản lý biểu tượng tùy chỉnh</div>
        <div class="qr-manage-list" id="${Constants.ID_LIST_MANAGE}">
            ${listHtml}
        </div>
        <div class="qr-modal-footer">
            <button id="${Constants.ID_BTN_CLOSE_MANAGE}" class="menu_button" data-i18n="qra_btn_close">Đóng</button>
        </div>
    </div>`;
}

function createAddModalHtml() {
    return `
    <div class="qr-modal-box" id="${Constants.ID_MODAL_ADD}">
        <div class="qr-modal-header" data-i18n="qra_modal_add_title">Thêm biểu tượng tùy chỉnh</div>

        <div class="qr-input-group">
            <label data-i18n="qra_label_name">Tên:</label>
            <input type="text" id="${Constants.ID_INPUT_ADD_NAME}" class="text_pole" placeholder="Ví dụ: Paimon" data-i18n="[placeholder]qra_placeholder_name">
        </div>

        <div class="qr-input-group">
            <div style="display:flex; justify-content:space-between;">
                <label data-i18n="qra_label_icon_url">URL biểu tượng:</label>
                <a href="https://catbox.moe/" target="_blank" class="qr-upload-link" title="Mở Catbox để tải ảnh lên">
                    <i class="fa-solid fa-cloud-arrow-up"></i> <span data-i18n="qra_link_image_host">Host ảnh miễn phí</span>
                </a>
            </div>
            <input type="text" id="${Constants.ID_INPUT_ADD_URL}" class="text_pole" placeholder="Nhập đường dẫn trực tiếp của ảnh" data-i18n="[placeholder]qra_placeholder_url">
        </div>

        <div class="qr-input-group">
            <label data-i18n="qra_label_icon_size_hint">Kích thước biểu tượng (Mặc định 1.2 sẽ hiển thị bằng kích thước nút Gửi gốc. Vui lòng không đổi nếu không cần thiết):</label>
            <input type="number" id="${Constants.ID_INPUT_ADD_SIZE}" class="text_pole" value="1.2" step="0.1" min="0.1" placeholder="Ví dụ: 1.2">
        </div>

        <div class="qr-input-group">
            <label data-i18n="qra_label_preview">Xem trước:</label>
            <div class="qr-icon-preview-box" id="${Constants.ID_PREVIEW_ADD}" style="min-height:80px; font-size:1.5em;">
                <span>Đang tải...</span>
            </div>
        </div>

        <div class="qr-modal-footer">
            <button id="${Constants.ID_BTN_SAVE_NEW}" class="menu_button primary" data-i18n="qra_btn_save">Lưu</button>
            <button class="menu_button" onclick="document.getElementById('${Constants.ID_MODAL_OVERLAY}').classList.remove('visible')" data-i18n="qra_btn_cancel">Hủy</button>
        </div>
    </div>`;
}

function createEditModalHtml(icon) {
    // Tái sử dụng ID từ Constants vì các popup loại trừ lẫn nhau, sẽ không gây xung đột
    return `
    <div class="qr-modal-box" id="${Constants.ID_MODAL_ADD}">
        <div class="qr-modal-header" data-i18n="qra_modal_edit_title">Sửa biểu tượng</div>

        <div class="qr-input-group">
            <label data-i18n="qra_label_name">Tên:</label>
            <input type="text" id="${Constants.ID_INPUT_ADD_NAME}" class="text_pole" value="${icon.name}">
        </div>

        <div class="qr-input-group">
            <div style="display:flex; justify-content:space-between;">
                <label data-i18n="qra_label_icon_url">URL biểu tượng:</label>
            </div>
            <input type="text" id="${Constants.ID_INPUT_ADD_URL}" class="text_pole" value="${icon.url}">
        </div>

        <div class="qr-input-group">
            <label data-i18n="qra_label_icon_size_hint">Kích thước biểu tượng (Mặc định 1.2 sẽ hiển thị bằng kích thước nút Gửi gốc. Vui lòng không đổi nếu không cần thiết):</label>
            <input type="number" id="${Constants.ID_INPUT_ADD_SIZE}" class="text_pole" value="${icon.size || '1.2'}" step="0.1" min="0.1">
        </div>

        <div class="qr-input-group">
            <label data-i18n="qra_label_preview">Xem trước:</label>
            <div class="qr-icon-preview-box" id="${Constants.ID_PREVIEW_ADD}" style="min-height:80px; font-size:1.5em;">
                <img src="${icon.url}" style="height: ${icon.size || '1.2'}em;">
            </div>
        </div>

        <div class="qr-modal-footer">
            <button id="qr-btn-save-edit" class="menu_button primary" data-i18n="qra_btn_save_changes">Lưu thay đổi</button>
            <button id="qr-btn-cancel-edit" class="menu_button" data-i18n="qra_btn_back">Quay lại</button>
        </div>
    </div>`;
}

export function handleSettingsChange(event) {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const id = event.target.id;
    const val = event.target.value;

    if (id === Constants.ID_SETTINGS_ENABLED_DROPDOWN) {
        settings.enabled = val === 'true';
        if (settings.enabled) {
            document.body.classList.add('qra-enabled');
            document.body.classList.remove('qra-disabled');
            const btn = document.getElementById(Constants.ID_ROCKET_BUTTON);
            if (btn) btn.style.display = 'flex';
        } else {
            document.body.classList.remove('qra-enabled');
            document.body.classList.add('qra-disabled');
            const btn = document.getElementById(Constants.ID_ROCKET_BUTTON);
            if (btn) btn.style.display = 'none';
        }
        applyWhitelistDOMChanges();
    }
    // --- Logic biểu tượng phiên bản mới ---
    else if (id === Constants.ID_BUILTIN_DROPDOWN) {
        settings.iconType = val;
        settings._builtinIconType = val;
        updateBuiltinPreview(val);
    }
    else if (id === Constants.ID_BUILTIN_SIZE_SELECT) {
        const isCustom = val === 'custom';
        const inputWrapper = document.getElementById(`${Constants.ID_BUILTIN_SIZE_INPUT}-wrapper`);
        const sizeInput = document.getElementById(Constants.ID_BUILTIN_SIZE_INPUT);

        if (inputWrapper) {
            inputWrapper.style.display = isCustom ? 'flex' : 'none';
        }

        if (!isCustom) {
            // Chuyển về "Khớp với nút Gửi", sao lưu giá trị tùy chỉnh vào _customSize
            const existingSize = parseFloat(settings.builtinIconSize);
            if (!isNaN(existingSize) && existingSize > 0) {
                settings._customIconSize = settings.builtinIconSize;
            }
            settings.builtinIconSize = 'match';
            if (sizeInput) sizeInput.value = '';
        } else {
            // Chuyển sang Tùy chỉnh: Ưu tiên khôi phục giá trị tùy chỉnh đã sao lưu trước đó
            const savedCustom = parseFloat(settings._customIconSize);
            if (!isNaN(savedCustom) && savedCustom > 0) {
                settings.builtinIconSize = settings._customIconSize;
                if (sizeInput) sizeInput.value = settings._customIconSize;
            } else {
                const existingSize = parseFloat(settings.builtinIconSize);
                if (!isNaN(existingSize) && existingSize > 0) {
                    if (sizeInput) sizeInput.value = settings.builtinIconSize;
                } else {
                    if (sizeInput) sizeInput.value = '1.2';
                    settings.builtinIconSize = '1.2';
                }
            }
        }
        updateBuiltinPreview(settings.iconType);
    }
    else if (id === Constants.ID_BUILTIN_SIZE_INPUT) {
        const sizeSelect = document.getElementById(Constants.ID_BUILTIN_SIZE_SELECT);
        if (sizeSelect && sizeSelect.value !== 'custom') return; // Chỉ phản hồi ở chế độ tùy chỉnh

        const numVal = parseFloat(val);
        if (!isNaN(numVal) && numVal > 0) {
            settings.builtinIconSize = val;
        } else {
            // Giá trị nhập không hợp lệ (số âm, 0, chữ cái, rỗng), quay về 'match'
            settings.builtinIconSize = 'match';
            if (sizeSelect) sizeSelect.value = 'match';
            const inputWrapper = document.getElementById(`${Constants.ID_BUILTIN_SIZE_INPUT}-wrapper`);
            if (inputWrapper) inputWrapper.style.display = 'none';
        }
        updateBuiltinPreview(settings.iconType);
    }
    else if (id === Constants.ID_CUSTOM_DROPDOWN) {
        const selectedUrl = val;
        settings.customIconUrl = selectedUrl;
        settings.iconType = Constants.ICON_TYPES.CUSTOM;
        updateCustomPreview(selectedUrl);
    }
    else if (id === Constants.ID_AUTO_SHRINK_CHECKBOX) {
        settings.autoShrinkEnabled = event.target.checked;
        if (settings.autoShrinkEnabled) injectAutoShrinkStyle();
        else removeAutoShrinkStyle();
    }
    else if (id === Constants.ID_BACKDROP_ENABLED_CHECKBOX) {
        settings.enableBackdrop = event.target.checked;
    }
    else if (id === Constants.ID_COMBINED_BUTTONS_CHECKBOX) {
        if (window.quickReplyApi && window.quickReplyApi.settings) {
            window.quickReplyApi.settings.isCombined = event.target.checked;
            window.quickReplyApi.settings.save();
            const origCheckbox = document.getElementById('qr--isCombined');
            if (origCheckbox) {
                origCheckbox.checked = event.target.checked;
            }
        }
    }
    else if (id === Constants.ID_UI_THEME_DROPDOWN) {
        settings.uiTheme = val;
        applyThemeStyles();
    }

    updateIconDisplay();
    saveSettings();
}

export function saveSettings() {
    const context = window.SillyTavern?.getContext();
    if (context && typeof context.saveSettingsDebounced === 'function') {
        context.saveSettingsDebounced();
    } else {
        Logger.warn(LogCategory.SYSTEM, 'Không tìm thấy hàm lưu cài đặt');
    }
}

export function loadAndApplySettings() {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];

    const setVal = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
    setVal(Constants.ID_SETTINGS_ENABLED_DROPDOWN, settings.enabled);
    setVal(Constants.ID_UI_THEME_DROPDOWN, settings.uiTheme || Constants.UI_THEMES.LIGHT);

    const shrink = document.getElementById(Constants.ID_AUTO_SHRINK_CHECKBOX);
    if(shrink) shrink.checked = settings.autoShrinkEnabled;

    const backdropCheck = document.getElementById(Constants.ID_BACKDROP_ENABLED_CHECKBOX);
    if(backdropCheck) backdropCheck.checked = settings.enableBackdrop;

    const combinedCheck = document.getElementById(Constants.ID_COMBINED_BUTTONS_CHECKBOX);
    if (combinedCheck) {
        combinedCheck.checked = window.quickReplyApi?.settings?.isCombined || false;
    }

    // --- Khởi tạo UI mới ---
    refreshCustomDropdown();

    const isCustom = settings.iconType === Constants.ICON_TYPES.CUSTOM;
    const isCharacter = settings.iconType === Constants.ICON_TYPES.CHARACTER_CARD;
    const isBuiltin = !isCustom && !isCharacter;
    const sourceSelect = document.getElementById(Constants.ID_ICON_SOURCE_SELECT);
    const panelBuiltin = document.getElementById(Constants.ID_PANEL_BUILTIN);
    const panelCustom = document.getElementById(Constants.ID_PANEL_CUSTOM);
    const panelCharacter = document.getElementById(Constants.ID_PANEL_CHARACTER);

    // Gán giá trị cho khung chọn và chuyển đổi bảng
    if (sourceSelect) sourceSelect.value = isCustom ? 'custom' : isCharacter ? 'character' : 'builtin';

    // Luôn khôi phục trạng thái DOM của tất cả các bảng, đảm bảo không bị mất cấu hình khi chuyển đổi lại
    // Khôi phục trạng thái bảng Biểu tượng tích hợp
    const builtinIconType = settings._builtinIconType || (isBuiltin ? settings.iconType : Constants.ICON_TYPES.STAR);
    const ddBuiltin = document.getElementById(Constants.ID_BUILTIN_DROPDOWN);
    if(ddBuiltin) ddBuiltin.value = builtinIconType;

    // Khôi phục thiết lập kích thước Biểu tượng tích hợp
    const sizeSelect = document.getElementById(Constants.ID_BUILTIN_SIZE_SELECT);
    const sizeInput = document.getElementById(Constants.ID_BUILTIN_SIZE_INPUT);
    const sizeInputWrapper = document.getElementById(`${Constants.ID_BUILTIN_SIZE_INPUT}-wrapper`);
    const sizeMode = settings.builtinIconSize || 'match';

    if (sizeMode === 'match') {
        if (sizeSelect) sizeSelect.value = 'match';
        if (sizeInput) sizeInput.value = '';
        if (sizeInputWrapper) sizeInputWrapper.style.display = 'none';
    } else {
        if (sizeSelect) sizeSelect.value = 'custom';
        if (sizeInput) sizeInput.value = sizeMode;
        if (sizeInputWrapper) sizeInputWrapper.style.display = 'flex';
    }

    updateBuiltinPreview(builtinIconType);

    // Hiển thị bảng đang kích hoạt
    if (isCustom) {
        if(panelCustom) panelCustom.classList.add('active');
        if(panelBuiltin) panelBuiltin.classList.remove('active');
        if(panelCharacter) panelCharacter.classList.remove('active');
        updateCustomPreview(settings.customIconUrl);
    } else if (isCharacter) {
        if(panelCharacter) panelCharacter.classList.add('active');
        if(panelBuiltin) panelBuiltin.classList.remove('active');
        if(panelCustom) panelCustom.classList.remove('active');
        updateCharacterPreview();
    } else {
        if(panelBuiltin) panelBuiltin.classList.add('active');
        if(panelCustom) panelCustom.classList.remove('active');
        if(panelCharacter) panelCharacter.classList.remove('active');
    }

    updateIconDisplay();

    if (settings.autoShrinkEnabled) injectAutoShrinkStyle();
    else removeAutoShrinkStyle();

    if (settings.enabled) {
        document.body.classList.add('qra-enabled');
        document.body.classList.remove('qra-disabled');
    } else {
        document.body.classList.remove('qra-enabled');
        document.body.classList.add('qra-disabled');
    }

    applyThemeStyles();

    // Khởi tạo vị trí thanh trượt
    setTimeout(() => {
        updateTabGliderState();
    }, 100); // Trì hoãn một chút để chờ DOM hiển thị bố cục

    // Làm mới trạng thái UI cập nhật (Sử dụng bộ nhớ đệm hoặc kiểm tra ngầm)
    refreshUpdateUI(false);

    // Khởi tạo hiển thị/ẩn vùng hướng dẫn Danh sách trắng
    const helpBox = document.getElementById(Constants.ID_WHITELIST_HELP_BOX);
    if (helpBox) {
        helpBox.style.display = settings.hideWhitelistHelp ? 'none' : 'block';
    }

    // --- Áp dụng thiết lập cấp độ nhật ký ---
    // Mặc định là 1 (INFO), tương thích với tệp cấu hình cũ
    const savedLevel = settings.logLevel !== undefined ? settings.logLevel : 1;

    // 1. Áp dụng cho Hệ thống Logger
    Logger.setLevel(savedLevel);

    // 2. Phản hồi về khung chọn UI
    const logSelect = document.getElementById('qr-log-level-select');
    if (logSelect) {
        logSelect.value = savedLevel;
    }

    // Khôi phục trạng thái công tắc xoay ảnh đại diện
    const toggleAvatarRotation = document.getElementById('qr-toggle-avatar-rotation');
    if (toggleAvatarRotation) {
        toggleAvatarRotation.checked = settings.enableAvatarRotation || false;
    }

    // Khởi tạo tên nút trong phần "Sắp xếp nút menu"
    const sortBtn = document.getElementById(Constants.ID_BTN_OPEN_SORT);
    if (sortBtn) {
        if (settings.enableCustomSort) {
            sortBtn.textContent = translate('Đã bật chế độ sắp xếp tùy chỉnh', 'qra_sort_btn_enabled');
            sortBtn.removeAttribute('data-i18n'); // Bỏ thuộc tính dịch gốc để không bị ghi đè
        } else {
            sortBtn.textContent = translate('Cài đặt', 'qra_btn_settings');
            sortBtn.setAttribute('data-i18n', 'qra_btn_settings');
        }
    }
}

export function populateWhitelistManagementUI() {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const { scripts, standard } = fetchQuickReplies();
    const all = [...scripts, ...standard];
    
    const map = new Map();
    all.forEach(r => {
        let id;
        let displayName = r.setName || r.label;

        if(r.source === 'JSSlashRunner') {
            id = `JSR::${r.scriptId}`;
        }
        else if(r.source === 'QuickReplyV2') {
            id = `QRV2::${r.setName}`;
        }
        else if(r.source === 'LittleWhiteBox') {
            // Nếu là tác vụ của thẻ nhân vật, dùng ID chung và hiển thị tên riêng
            if (r.isLwbCharSet) {
                id = 'LWB::Character_Set';
                // Yêu cầu: Hiển thị là "小白X-${Tên nhân vật hiện tại}"
                // r.setName trong api.js đã được đặt thành tên nhân vật
                displayName = `小白X-${r.setName}`;
            } else {
                id = `LWB::${r.taskScope}::${r.taskId}`;
                // Yêu cầu: Hiển thị là "小白X-${Tên script}"
                // r.taskId chính là tên script
                displayName = `小白X-${r.taskId}`;
            }
        }
        else if(r.source === 'RawDomElement') {
            // ID Danh sách trắng của nút bên thứ 3 (gốc) sử dụng trực tiếp domId của chúng
            id = r.domId; // vd: pt-wb-common-button hoặc zero-preset-btn
        }

        if(id && !map.has(id)) map.set(id, { name: displayName, scope: r.scope });
    });

    const nonList = document.getElementById('qrq-non-whitelisted-list');
    const wlList = document.getElementById('qrq-whitelisted-list');
    if(!nonList || !wlList) return;
    
    nonList.innerHTML = ''; wlList.innerHTML = '';
    
    map.forEach((data, id) => {
        // Trích xuất name và scope đã lưu từ object
        const { name, scope: savedScope } = data;

        const div = document.createElement('div');
        div.className = 'qrq-whitelist-item';

        // --- Logic ánh xạ biểu tượng ---
        let iconHtml = '';
        if (id.startsWith('JSR::')) {
            iconHtml = '<i class="fa-solid fa-moon" title="Script JSR"></i>';
        } else if (id.startsWith('LWB::')) {
            iconHtml = '<i class="fa-solid fa-sun" title="Tác vụ LittleWhiteBox"></i>';
        } else if (id.startsWith('QRV2::')) {
            iconHtml = '<i class="fa-solid fa-star" title="Phản hồi nhanh"></i>';
        } else {
            // Đặt cho các nút tiện ích gốc bên thứ 3 một biểu tượng "Mảnh ghép" chung
            iconHtml = '<i class="fa-solid fa-puzzle-piece" title="Bên thứ ba"></i>';
        }

        // Dùng flexbox để canh lề biểu tượng và văn bản
        div.innerHTML = `${iconHtml}<span style="flex:1; overflow:hidden; text-overflow:ellipsis;">${name}</span>`;

        div.onclick = () => {
            if (!Array.isArray(settings.whitelist)) settings.whitelist = [];

            const idx = settings.whitelist.indexOf(id);
            if(idx > -1) settings.whitelist.splice(idx, 1);
            else settings.whitelist.push(id);

            populateWhitelistManagementUI();
            saveSettings();
            if(window.quickReplyMenu?.applyWhitelistDOMChanges) window.quickReplyMenu.applyWhitelistDOMChanges();
        };

        // --- Logic thao tác nhấn giữ (Hover & Touch) ---

        // 1. Dựng trước object dữ liệu
        let source = 'Unknown';
        // Ưu tiên dùng scope truyền từ api.js, nếu không có thì lấy mặc định là global
        let scope = savedScope || 'global';

        if (id.startsWith('JSR::')) source = 'JSSlashRunner';
        else if (id.startsWith('QRV2::')) source = 'QuickReplyV2';
        else if (id.startsWith('LWB::')) {
            source = 'LittleWhiteBox';
            // Vẫn giữ logic phân tích ID cho LWB để đảm bảo độ chính xác
            scope = id.split('::')[1]; // LWB::{scope}::{taskId}
        }
        else if (id === 'pt-wb-common-button' || id === 'zero-preset-btn') {
            source = 'RawDomElement';
        }

        const mockReply = {
            source: source,
            scope: scope,
            label: name,
            setName: name
        };

        // 2. Biến điều khiển trạng thái
        let pressTimer = null;
        let isTouchAction = false;

        // 3. Chuột di chuột (Desktop)
        div.addEventListener('mouseenter', (e) => {
            // Nếu do sự kiện vuốt chạm mô phỏng chuột, bỏ qua để tránh việc bung tooltip khi bấm
            if (isTouchAction) return;
            showTooltip(e, mockReply, true);
        });

        div.addEventListener('mouseleave', () => {
            hideTooltip();
        });

        // 4. Nhấn giữ màn hình cảm ứng (Mobile)
        div.addEventListener('touchstart', (e) => {
            isTouchAction = true;
            pressTimer = setTimeout(() => {
                // Hiển thị thông tin sau khi nhấn giữ 600ms
                // Khắc phục: Trong callback bất đồng bộ, currentTarget gốc sẽ bị mất,
                // bắt buộc chụp rõ phần tử DOM hiện tại (div) rồi tạo event mô phỏng truyền vào showTooltip
                const mockEvent = { currentTarget: div };
                showTooltip(mockEvent, mockReply, true);
            }, 600);
        }, { passive: true });

        const clearTouchState = () => {
            if (pressTimer) clearTimeout(pressTimer);
            hideTooltip(); // Nhả tay ẩn tooltip
            // Trì hoãn việc đặt lại trạng thái, đảm bảo vượt qua chu kỳ sự kiện mouseenter/click ngay sau đó
            setTimeout(() => { isTouchAction = false; }, 500);
        };

        div.addEventListener('touchend', clearTouchState, { passive: true });

        div.addEventListener('touchmove', () => {
            // Nếu ngón tay di chuyển, xem như đang vuốt, hủy bỏ việc tính nhấn giữ
            if (pressTimer) clearTimeout(pressTimer);
            hideTooltip();
            // Đặt lại cờ để tránh isTouchAction bị treo true vĩnh viễn gây chặn mouseenter sau này
            setTimeout(() => { isTouchAction = false; }, 500);
        }, { passive: true });

        if(settings.whitelist.includes(id)) wlList.appendChild(div);
        else nonList.appendChild(div);
    });

    attachScrollListener(nonList);
    attachScrollListener(wlList);

    // Dự phòng mức khung chứa (Container level): Bắt buộc ẩn tooltip khi trỏ chuột thoát khỏi khu vực danh sách
    nonList.addEventListener('mouseleave', hideTooltip);
    wlList.addEventListener('mouseleave', hideTooltip);
}

export function setupEventListeners() {
    const bind = (id, handler) => document.getElementById(id)?.addEventListener('change', handler);

    bind(Constants.ID_SETTINGS_ENABLED_DROPDOWN, handleSettingsChange);
    bind(Constants.ID_AUTO_SHRINK_CHECKBOX, handleSettingsChange);
    bind(Constants.ID_BACKDROP_ENABLED_CHECKBOX, handleSettingsChange);
    bind(Constants.ID_COMBINED_BUTTONS_CHECKBOX, handleSettingsChange);
    bind(Constants.ID_UI_THEME_DROPDOWN, handleSettingsChange);

    // --- Lắng nghe giao diện cài đặt biểu tượng mới ---
    const sourceSelect = document.getElementById(Constants.ID_ICON_SOURCE_SELECT);
    const panelBuiltin = document.getElementById(Constants.ID_PANEL_BUILTIN);
    const panelCustom = document.getElementById(Constants.ID_PANEL_CUSTOM);

    if (sourceSelect) {
        sourceSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const isCustom = val === 'custom';
            const isCharacter = val === 'character';
            const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];

            const panelCharacter = document.getElementById(Constants.ID_PANEL_CHARACTER);

            if (isCustom) {
                // Lưu bản sao trạng thái biểu tượng tích hợp hiện tại (nếu đang ở chế độ biểu tượng tích hợp)
                if (settings.iconType !== Constants.ICON_TYPES.CUSTOM && settings.iconType !== Constants.ICON_TYPES.CHARACTER_CARD) {
                    settings._builtinIconType = settings.iconType;
                }
                panelCustom.classList.add('active');
                panelBuiltin.classList.remove('active');
                if (panelCharacter) panelCharacter.classList.remove('active');
                settings.iconType = Constants.ICON_TYPES.CUSTOM;

                // Tự động chọn biểu tượng tùy chỉnh đầu tiên (nếu có và chưa chọn)
                if (!settings.customIconUrl && settings.savedCustomIcons?.length > 0) {
                    settings.customIconUrl = settings.savedCustomIcons[0].url;
                    const dd = document.getElementById(Constants.ID_CUSTOM_DROPDOWN);
                    if(dd) dd.value = settings.customIconUrl;
                }
            } else if (isCharacter) {
                // Lưu bản sao trạng thái biểu tượng tích hợp hiện tại (nếu đang ở chế độ biểu tượng tích hợp)
                if (settings.iconType !== Constants.ICON_TYPES.CUSTOM && settings.iconType !== Constants.ICON_TYPES.CHARACTER_CARD) {
                    settings._builtinIconType = settings.iconType;
                }
                if (panelCharacter) panelCharacter.classList.add('active');
                panelBuiltin.classList.remove('active');
                panelCustom.classList.remove('active');
                settings.iconType = Constants.ICON_TYPES.CHARACTER_CARD;
                updateCharacterPreview();
            } else {
                panelBuiltin.classList.add('active');
                panelCustom.classList.remove('active');
                if (panelCharacter) panelCharacter.classList.remove('active');

                // Khôi phục biểu tượng tích hợp từ bản sao đã lưu
                settings.iconType = settings._builtinIconType || Constants.ICON_TYPES.STAR;
            }
            saveSettings();
            updateIconDisplay();
        });
    }

    bind(Constants.ID_BUILTIN_DROPDOWN, handleSettingsChange);
    bind(Constants.ID_BUILTIN_SIZE_SELECT, handleSettingsChange);
    bind(Constants.ID_BUILTIN_SIZE_INPUT, handleSettingsChange);
    bind(Constants.ID_CUSTOM_DROPDOWN, handleSettingsChange);

    const btnManage = document.getElementById(Constants.ID_BTN_MANAGE_CUSTOM);
    if (btnManage) btnManage.onclick = openManageModal;

    const btnAdd = document.getElementById(Constants.ID_BTN_ADD_CUSTOM);
    if (btnAdd) btnAdd.onclick = openAddModal;

    // Xóa trình lắng nghe nút danh sách trắng (ID_WHITELIST_BUTTON) cũ do không còn tồn tại

    // Sự kiện khi click vào TAB Danh sách trắng
    const wlTab = document.getElementById(Constants.ID_TAB_WHITELIST);
    if (wlTab) {
        wlTab.addEventListener('click', () => {
            // Làm mới lại dữ liệu khi chuyển qua trang danh sách trắng
            populateWhitelistManagementUI();
        });
    }

    // Sự kiện khi click vào nút Hướng dẫn sử dụng
    const helpBtn = document.getElementById(Constants.ID_BTN_OPEN_HELP);
    if (helpBtn) {
        helpBtn.onclick = () => {
             openHelpModal();
        };
    }

    // Sự kiện khi click vào nút Sắp xếp cài đặt
    const sortBtn = document.getElementById(Constants.ID_BTN_OPEN_SORT);
    if (sortBtn) {
        sortBtn.onclick = () => {
             openSortModal();
        };
    }

    // (Đã xóa định nghĩa updateGliderPosition cục bộ)

    const tabs = document.querySelectorAll('.qr-settings-tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            const currentTab = e.currentTarget;
            currentTab.classList.add('active');

            // Di chuyển thanh trượt (Gọi hàm export)
            updateTabGliderState();

            const pages = document.querySelectorAll('.qr-settings-page');
            pages.forEach(p => p.classList.remove('active'));

            const targetId = currentTab.getAttribute('data-tab');
            const targetPage = document.getElementById(targetId);
            if(targetPage) targetPage.classList.add('active');
        });
    });

    const themeDropdown = document.getElementById('themes');
    if (themeDropdown) {
        themeDropdown.addEventListener('change', () => {
            setTimeout(() => {
                updateIconDisplay();
            }, 500);
        });
    }

    // Lắng nghe nút cập nhật
    const btnUpdate = document.getElementById(Constants.ID_BTN_CHECK_UPDATE);
    if (btnUpdate) {
        btnUpdate.onclick = async (e) => {
            // Chặn sự kiện nhấp lan (bubbling) gây đóng bảng 
            e.stopPropagation();
            const btn = document.getElementById(Constants.ID_BTN_CHECK_UPDATE);
            // Nếu nút đang báo đỏ (có bản cập nhật), ấn vào sẽ hiện popup cập nhật
            if (btn.classList.contains('has-update')) {
                showUpdateModal();
            } else {
                // Ngược lại thì quét lại trạng thái
                btn.textContent = translate("Đang kiểm tra...", 'qra_checking');
                await refreshUpdateUI(true);
                const isUpdated = btn.classList.contains('has-update');
                if (!isUpdated) btn.textContent = translate("Đã là bản mới nhất", 'qra_up_to_date');
            }
        };
    }

    // ============================================================
    // Tránh việc nhấn trong popup làm tắt ngầm bảng cài đặt extension của ST
    // ============================================================
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    if (overlay) {
        // Viết hàm cản sự kiện nổi bọt
        const stopPropagation = (e) => {
            e.stopPropagation();
        };

        // SillyTavern trong tệp script.js đang lắng nghe các sự kiện 'touchstart' và 'mousedown'
        // Chúng ta cần đánh chặn chúng ngay trên overlay trước khi chúng chọc qua thẻ html
        overlay.addEventListener('mousedown', stopPropagation);
        overlay.addEventListener('touchstart', stopPropagation);
        overlay.addEventListener('click', stopPropagation);

        // Chặn luồng con lăn cũng thế để khỏi dính (có thể không quá cần thiết nhưng tốt)
        overlay.addEventListener('wheel', stopPropagation, { passive: true });
    }
    // ============================================================

    // Bắt sự kiện bấm vào các dấu chấm hỏi nhỏ
    const settingHelpIcons = document.querySelectorAll('.qr-setting-help-icon');
    settingHelpIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const helpKey = icon.getAttribute('data-help');
            openSettingHelpModal(helpKey);
        });
    });

    // Phần giải thích trong Danh sách trắng - Logic nút "Đừng hiện lại"
    const btnDismissHelp = document.getElementById(Constants.ID_BTN_DISMISS_WHITELIST_HELP);
    if (btnDismissHelp) {
        btnDismissHelp.onclick = () => {
            const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
            settings.hideWhitelistHelp = true;
            saveSettings();

            const box = document.getElementById(Constants.ID_WHITELIST_HELP_BOX);
            if (box) box.style.display = 'none';
        };
    }

    // Khởi tạo các thiết đặt cho Logs
    initLogSettings();

    // Sự kiện nút bật/tắt xoay ảnh đại diện
    const toggleAvatarRotation = document.getElementById('qr-toggle-avatar-rotation');
    if (toggleAvatarRotation) {
        toggleAvatarRotation.addEventListener('change', (e) => {
            const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
            settings.enableAvatarRotation = e.target.checked;
            saveSettings();
        });
    }

    // Bắt sự kiện gốc từ nút Gộp của QRv2 để thực hiện đồng bộ hai chiều
    document.body.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'qr--isCombined') {
            const combinedCheck = document.getElementById(Constants.ID_COMBINED_BUTTONS_CHECKBOX);
            if (combinedCheck) {
                combinedCheck.checked = e.target.checked;
            }
        }
    });
}

// Chèn nhóm thẻ theme xuống thẳng thẻ body
export function applyThemeStyles() {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const theme = settings.uiTheme || Constants.UI_THEMES.LIGHT;

    // 1. Phác thảo bộ danh sách các tên chủ đề đã biết
    const allThemeClasses = Object.values(Constants.UI_THEMES).filter(t => t !== 'light' && t !== 'system');
    // Gắn thủ công một thẻ lớp system giả
    allThemeClasses.push('qra-theme-system');

    // 2. Chùi sạch lớp nền chủ đề cũ
    document.body.classList.remove(...allThemeClasses);

    // 3. Trát lại lớp nền vừa mới chọn
    if (theme === Constants.UI_THEMES.SYSTEM) {
        document.body.classList.add('qra-theme-system');
    } else if (theme !== Constants.UI_THEMES.LIGHT) {
        // Chế độ sáng (Light) dùng cấu hình :root trong CSS làm mặc định, không cần thêm class
        document.body.classList.add(theme);
    }
}

// --- Hàm chức năng nháp hỗ trợ xem trước cho UI ---
export function updateBuiltinPreview(type) {
    const el = document.getElementById(Constants.ID_BUILTIN_PREVIEW);
    if(!el) return;
    const iconClass = Constants.ICON_CLASS_MAP[type] || 'fa-star-and-crescent';

    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const sizeMode = settings.builtinIconSize || 'match';

    let sizeStyle = '';
    if (sizeMode !== 'match') {
        const numVal = parseFloat(sizeMode);
        if (!isNaN(numVal) && numVal > 0) {
            sizeStyle = `font-size: ${sizeMode}em;`;
        }
    }

    el.innerHTML = `<i class="fa-solid ${iconClass}" style="${sizeStyle}"></i><span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>`;
}

function updateCustomPreview(url) {
    const el = document.getElementById(Constants.ID_CUSTOM_PREVIEW);
    if(!el) return;
    if (url) {
        el.innerHTML = `<img src="${url}"><span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>`;
    } else {
        el.innerHTML = `<span data-i18n="qra_custom_no_icon">Không có</span><span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>`;
    }
}

export function updateCharacterPreview() {
    const el = document.getElementById(`${Constants.ID_PANEL_CHARACTER}-preview`);
    if (!el) return;
    const avatarImg = document.querySelector("#avatar_load_preview");
    if (avatarImg && avatarImg.src) {
        el.innerHTML = `<img src="${avatarImg.src}" class="qr-character-preview-avatar"><span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>`;
    } else {
        el.innerHTML = `<span data-i18n="qra_char_no_avatar">Không có ảnh nhân vật</span><span class="qr-icon-preview-label" data-i18n="qra_label_preview">Xem trước</span>`;
    }
}

// --- Hàm tạo cửa sổ chức năng dạng Modal ---
function openManageModal() {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);

    // Xử lý tạo hình mảng mục quản lý
    overlay.innerHTML = createManageModalHtml(settings.savedCustomIcons);
    overlay.classList.add('visible');

    // Móc sự kiện đính lên phím đóng
    document.getElementById(Constants.ID_BTN_CLOSE_MANAGE).onclick = () => {
        overlay.classList.remove('visible');
        refreshCustomDropdown(); // Vừa tắt vừa làm mới thả xuống bên ngoài cho chắc
    };

    // --- Khối xóa ---
    window.quickReplyMenu.deleteIcon = (index) => {
        if(!confirm(translate('Bạn có chắc chắn muốn xóa biểu tượng này không?', 'qra_confirm_delete_icon'))) return;

        // Nếu xui rủi biểu tượng đang xóa chính là thứ đang gắn, thì đưa tất cả về số không
        const deletedUrl = settings.savedCustomIcons[index].url;
        if (settings.customIconUrl === deletedUrl) {
            settings.customIconUrl = '';
            // Nhập nhằng: Đưa lại về hình ngôi sao
            // settings.iconType = Constants.ICON_TYPES.STAR;
            updateIconDisplay();
        }

        settings.savedCustomIcons.splice(index, 1);
        saveSettings();
        openManageModal(); // Vẽ lại giao diện quản lý
    };

    // --- Khối sửa đổi ---
    window.quickReplyMenu.editIcon = (index) => {
        const icon = settings.savedCustomIcons[index];
        if (!icon) return;

        // 1. Phết giao diện bảng sửa đổi chồng qua
        overlay.innerHTML = createEditModalHtml(icon);

        // 2. Chế tạo cái màn hình chiếu thử (y xì như mục thêm)
        const inputUrl = document.getElementById(Constants.ID_INPUT_ADD_URL);
        const inputSize = document.getElementById(Constants.ID_INPUT_ADD_SIZE);
        const previewBox = document.getElementById(Constants.ID_PREVIEW_ADD);

        const updatePreview = () => {
             const u = inputUrl.value.trim();
             const s = inputSize.value || '1.2';
             if (u) {
                 previewBox.innerHTML = `<img src="${u}" style="max-width:80%; max-height:80%; height: ${s}em;">`;
             }
        };
        inputUrl.addEventListener('input', updatePreview);
        inputSize.addEventListener('input', updatePreview);

        // 3. Phím "Trở lại" (lui lại list)
        document.getElementById('qr-btn-cancel-edit').onclick = () => {
            openManageModal();
        };

        // 4. Phím "Bảo tồn" cấu trúc (Lưu)
        document.getElementById('qr-btn-save-edit').onclick = () => {
            const newName = document.getElementById(Constants.ID_INPUT_ADD_NAME).value.trim();
            const newUrl = inputUrl.value.trim();
            const newSize = inputSize.value;

            if (newName && newUrl) {
                // Nhồi dữ liệu mới
                settings.savedCustomIcons[index] = {
                    name: newName,
                    url: newUrl,
                    size: newSize
                };

                // Trái đắng: Đổi đúng cái icon đang gắn thì phải cho hiển thị cập nhật chớp mắt
                // Chừng nào mã URL y đúc cũ, hoặc URL nắn lại nhưng khớp với chuỗi chọn hiện thời
                if (settings.iconType === Constants.ICON_TYPES.CUSTOM) {
                     // Nhanh gọn: Nếu url vẫn bám theo link cũ, quăng cho mớ chuỗi vừa nhúng mới
                     if (settings.customIconUrl === icon.url) {
                         settings.customIconUrl = newUrl;
                     }
                     // Trăm sự nhờ cậy: Cứ hễ bật cờ Custom là cho quét lại icon lần nữa để bắt chuẩn size
                     if (settings.customIconUrl === newUrl) {
                         updateIconDisplay();
                     }
                }

                saveSettings();
                openManageModal(); // Sửa xong thì quay trở lại list
            } else {
                alert(translate("Tên và đường dẫn liên kết không được phép để trống.", 'qra_alert_name_url_required'));
            }
        };
    };
}

function openAddModal() {
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    overlay.innerHTML = createAddModalHtml();
    overlay.classList.add('visible');

    const inputUrl = document.getElementById(Constants.ID_INPUT_ADD_URL);
    const inputName = document.getElementById(Constants.ID_INPUT_ADD_NAME);
    const inputSize = document.getElementById(Constants.ID_INPUT_ADD_SIZE);
    const preview = document.getElementById(Constants.ID_PREVIEW_ADD);

    // Hàm bao chép việc chiếu trước ảnh
    const updatePreview = () => {
        const url = inputUrl.value.trim();
        const size = inputSize.value || '1.2';
        if (url) {
            preview.innerHTML = `<img src="${url}" style="max-width:80%; max-height:80%; height: ${size}em;">`;
        } else {
            preview.innerHTML = '<span>Đang tải...</span>';
        }
    };

    // Theo dõi và gắn ảnh chớp nhoáng
    inputUrl.addEventListener('input', updatePreview);
    inputSize.addEventListener('input', updatePreview);

    document.getElementById(Constants.ID_BTN_SAVE_NEW).onclick = () => {
        const url = inputUrl.value.trim();
        const name = inputName.value.trim() || translate('Biểu tượng chưa đặt tên', 'qra_unnamed_icon');
        const size = inputSize.value || '1.2';

        if (!url) {
            alert(translate('Xin vui lòng điền URL của biểu tượng.', 'qra_alert_url_required'));
            return;
        }

        const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
        if (!settings.savedCustomIcons) settings.savedCustomIcons = [];

        settings.savedCustomIcons.push({ name, url, size });
        settings.customIconUrl = url;
        settings.iconType = Constants.ICON_TYPES.CUSTOM;

        saveSettings();
        overlay.classList.remove('visible');

        refreshCustomDropdown();
        // Nhảy đến bảng menu chọn luôn và gọi bắt chớp hàm change
        const select = document.getElementById(Constants.ID_ICON_SOURCE_SELECT);
        if(select) {
            select.value = 'custom';
            select.dispatchEvent(new Event('change'));
        }
    };
}

function refreshCustomDropdown() {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const dd = document.getElementById(Constants.ID_CUSTOM_DROPDOWN);
    if (!dd) return;

    dd.innerHTML = `<option value="">${translate('-- Chọn --', 'qra_custom_select')}</option>`;
    if (settings.savedCustomIcons) {
        settings.savedCustomIcons.forEach(icon => {
            const opt = document.createElement('option');
            opt.value = icon.url;
            opt.textContent = icon.name;
            dd.appendChild(opt);
        });
    }
    dd.value = settings.customIconUrl || '';
    updateCustomPreview(dd.value);
}

// HTML rời của Modal Overlay (màn đen lót lưng) chỉ rình để đâm thẳng vào body
export function createModalOverlayHtml() {
    return `<div id="${Constants.ID_MODAL_OVERLAY}" class="qr-modal-overlay"></div>`;
}

// --- Cụm logic bung Bảng Hướng dẫn chỉ thị ---

function createHelpModalHtml() {
    const lang = getCurrentLocale();
    const content = helpDocs[lang] || helpDocs['en'] || helpDocs['zh-cn'];

    return `
    <div class="qr-modal-box qr-help-mode" id="${Constants.ID_MODAL_HELP}">
        <!-- 1. Đầu trang -->
        <div class="qr-help-header">
            <div class="qr-help-header-left">
                <button class="qr-help-sidebar-toggle" id="${Constants.ID_BTN_TOGGLE_SIDEBAR}" title="${translate('Mục lục', 'qra_title_toc')}">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <span data-i18n="qra_help_title">Hướng dẫn sử dụng QR Assistant</span>
            </div>
            <button class="qr-help-close-btn" onclick="document.getElementById('${Constants.ID_MODAL_OVERLAY}').classList.remove('visible')">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- 2. Phần phân chia luồng khung nhìn hai nhánh -->
        <div class="qr-help-split-layout">
            <!-- Mục lục trái tim -->
            <div class="qr-help-sidebar">
                <div class="qr-toc-item active" data-target="help-video" data-i18n="qra_help_toc_video">Đoạn phim ví dụ</div>
                <div class="qr-toc-item" data-target="help-core" data-i18n="qra_help_toc_core">Cốt lõi chức năng</div>
                <div class="qr-toc-item" data-target="help-detail" data-i18n="qra_help_toc_detail">Chi tiết năng lực</div>
                <div class="qr-toc-item sub" data-target="help-whitelist" data-i18n="qra_help_toc_whitelist">Vùng danh sách trắng</div>
                <div class="qr-toc-item sub" data-target="help-icons" data-i18n="qra_help_toc_icons">Hệ thống Biểu tượng</div>
                <div class="qr-toc-item sub" data-target="help-theme" data-i18n="qra_help_toc_theme">Tạo hình khung áo (Theme)</div>
                <div class="qr-toc-item sub" data-target="help-sort" data-i18n="qra_help_toc_sort">Thứ tự nút Menu</div>
                <div class="qr-toc-item sub" data-target="help-others" data-i18n="qra_help_toc_others">Lặt vặt chức năng</div>
                <div class="qr-toc-item sub" data-target="help-compat" data-i18n="qra_help_toc_compat">Hỗ trợ qua lại ứng dụng bên thứ 3</div>
                <div class="qr-toc-item sub" data-target="help-update" data-i18n="qra_help_toc_update">Trinh sát bản mới</div>
            </div>

            <!-- Bài viết phải nhịp -->
            <div class="qr-help-content" id="qr-help-scroll-view">
                ${content}
            </div>
        </div>
    </div>`;
}

function openHelpModal() {
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    if (!overlay) return;

    overlay.innerHTML = createHelpModalHtml();
    overlay.classList.add('visible');

    const splitLayout = overlay.querySelector('.qr-help-split-layout');
    const sidebar = overlay.querySelector('.qr-help-sidebar');
    const toggleBtn = document.getElementById(Constants.ID_BTN_TOGGLE_SIDEBAR);

    // Móc cần phím rút-tung ra của viền hông
    if (toggleBtn && splitLayout) {
        toggleBtn.addEventListener('click', () => {
            splitLayout.classList.toggle('qr-sidebar-open');
        });
        // Ấn lọt xuống nền bài viết tự bóp gọn gàng lại hông viền (Đối phó UI ĐTDĐ)
        const content = overlay.querySelector('.qr-help-content');
        if (content) {
            content.addEventListener('click', () => {
                splitLayout.classList.remove('qr-sidebar-open');
            });
        }
    }

    // Móc cần phím click nhắm mục lục
    const items = overlay.querySelectorAll('.qr-toc-item');
    const scrollView = document.getElementById('qr-help-scroll-view');

    items.forEach(item => {
        item.addEventListener('click', () => {
            // Chuyển màu bôi sáng
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Bắn tầm nhìn cuộn thẳng đến chỗ
            const targetId = item.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl && scrollView) {
                // Nhờ scrollIntoView hoặc đo tọa độ thủ công
                // Đóng bớt 20px nhằm thả thưa tầm trần nhìn trên cao
                const topPos = targetEl.offsetTop - scrollView.offsetTop;
                scrollView.scrollTo({ top: topPos, behavior: 'smooth' });
            }

            // Giao diện ĐTDĐ ấn xong phải tự bóp lại
            if (splitLayout) {
                splitLayout.classList.remove('qr-sidebar-open');
            }
        });
    });

    // Bắt lăn chuột: tự theo dõi tọa độ cuộn màn rồi đẩy lùi chấm đèn bên cột trái mục lục
    if (scrollView) {
        scrollView.addEventListener('scroll', () => {
            const scrollTop = scrollView.scrollTop;
            const targets = Array.from(items).map(item => {
                const el = document.getElementById(item.getAttribute('data-target'));
                return el ? { item, offsetTop: el.offsetTop - scrollView.offsetTop } : null;
            }).filter(Boolean);

            // Truy tìm xem mảnh miếng nào trên mặt đang ôm điểm cuộn gần nhất
            let activeItem = targets[0]?.item;
            for (const t of targets) {
                if (scrollTop >= t.offsetTop - 20) {
                    activeItem = t.item;
                }
            }

            if (activeItem && !activeItem.classList.contains('active')) {
                items.forEach(i => i.classList.remove('active'));
                activeItem.classList.add('active');
            }
        });
    }
}

// --- Cụm bảng hiện Log mới cập nhật của Extension ---
function createChangelogModalHtml(changelogText) {
    return `
    <div class="qr-modal-box" id="${Constants.ID_MODAL_UPDATE}">
        <div class="qr-modal-header" data-i18n="qra_modal_update_title">Nhật ký cập nhật tiện ích</div>
        <div class="qr-changelog-viewer" id="${Constants.ID_CHANGELOG_CONTENT}">${changelogText}</div>
        <div class="qr-update-tip" data-i18n="qra_update_tip">Trường hợp cập nhật không thông qua, các bạn hãy vào phần [Tiện ích mở rộng] và bấm nút cập nhật thủ công cho bảng QR Assistant. Vẫn không thành công xin cứ xóa và tự lên kho tải dội ngược cài lại từ đầu cho sạch.</div>
        <div class="qr-modal-footer">
            <button id="${Constants.ID_BTN_CONFIRM_UPDATE}" class="menu_button primary" data-i18n="qra_btn_update_now">Mở tiến trình Cập nhật</button>
            <button class="menu_button" onclick="document.getElementById('${Constants.ID_MODAL_OVERLAY}').classList.remove('visible')" data-i18n="qra_btn_cancel">Hủy lệnh</button>
        </div>
    </div>`;
}

async function showUpdateModal() {
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    // Bơm trước Loading che màn
    overlay.innerHTML = `<div class="qr-modal-box" style="text-align:center; padding:30px;">${translate("Đang nạp dữ liệu nhật ký...", 'qra_loading_changelog')}</div>`;
    overlay.classList.add('visible');

    const changelog = await getChangelog();

    // Rải sương sương Markdown nháp tránh lỗi XSS cơ bản do lọt thỏm HTML (Hoặc mượn trình Markdown có sẵn của ST nếu rảnh)
    // Tạm chêm thoát thẻ góc cho yên bụng
    const safeLog = changelog.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    overlay.innerHTML = createChangelogModalHtml(safeLog);

    const btnUpdate = document.getElementById(Constants.ID_BTN_CONFIRM_UPDATE);
    if (btnUpdate) {
        btnUpdate.onclick = async () => {
            if (confirm(translate('Thao tác Cập nhật đồng nghĩa với việc F5 lại tải nguyên trang, bạn hãy chắc chắn rằng khung hội thoại đã được lưu.\nBạn chắc chắn chứ?', 'qra_confirm_update'))) {
                btnUpdate.disabled = true;
                btnUpdate.textContent = translate("Đang khởi động cập nhật...", 'qra_checking');
                try {
                    const res = await performUpdate();
                    if (res.ok) {
                        alert(translate('Thư báo lệnh Cập nhật đã bắn đi thành công. Trang sẽ F5 sau vài tích tắc.', 'qra_alert_update_sent'));
                        setTimeout(() => location.reload(), 2000);
                    } else {
                        alert(translate('Lệnh Cập nhật ngã ngựa, vui lòng bật bảng devtools F12 rà soát lại thông tin.', 'qra_alert_update_failed'));
                        btnUpdate.disabled = false;
                    }
                } catch (e) {
                    alert(translate('Có lỗi bất thường xảy ra trong quá trình nổ máy yêu cầu Cập nhật: ', 'qra_alert_update_error') + e);
                    btnUpdate.disabled = false;
                }
            }
        };
    }
}

// Bơm tải trinh sát làm mới hiện trạng cho UI Cập nhật
export async function refreshUpdateUI(force = false) {
    const btn = document.getElementById(Constants.ID_BTN_CHECK_UPDATE);
    const verDisplay = document.getElementById(Constants.ID_VERSION_DISPLAY);
    
    // Nếu bị áp ép truy xét, cứ đưa ra chữ Đang chạy đi
    if (force && verDisplay) verDisplay.textContent = translate("Đang kiểm tra...", 'qra_checking');

    const result = await checkForUpdates(force);

    // Có thư là phết con số Phiên bản cái rụp
    if (result && verDisplay) {
        verDisplay.textContent = result.localVersion || 'Unknown';
    }

    // Tiếp tuyến xử lý đèn chớp "Có bản mới à nghen"
    const badge = document.getElementById(Constants.ID_NEW_VERSION_BADGE);
    
    if (!result) {
        // Dính biến cố: Không moi được tin
        if (verDisplay) verDisplay.textContent = "Error";
        return;
    }

    if (result.hasUpdate) {
        if (badge) badge.classList.add('visible');
        if (btn) {
            btn.textContent = translate("Đã dò thấy phiên bản mới", 'qra_new_version_found');
            btn.classList.add('has-update');
            btn.title = `Phiên bản trần nhất: ${result.latestVersion}`;
        }
    } else {
        if (badge) badge.classList.remove('visible');
        if (btn) {
            // Trường hợp truy vấn ra biển lớn khép cờ
            if (result.latestVersion === "Check Failed") {
                btn.textContent = translate("Không dò thấy tín hiệu", 'qra_check_failed');
            } else {
                btn.textContent = translate("Kiểm tra cập nhật", 'qra_btn_check_update');
            }
            btn.classList.remove('has-update');
            btn.removeAttribute('title');
        }
    }
}

// --- Khối xử lý cho Bảng Ghi chép Log của riêng Extension ---

/**
 * Xương cốt HTML tạc Bảng nhật ký Log
 */
function createLogModalHtml() {
    return `
    <div class="qr-modal-box" id="${Constants.ID_MODAL_LOG}" style="width: 800px; height: 80vh; max-height: 90vh;">
        <!-- Đảo ngược layout dùng Flex cắm nhãn lề trái, khay phím chắp cánh lề phải -->
        <div class="qr-modal-header" style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 16px; font-weight: bold;" data-i18n="qra_log_title">Bảng Theo Dõi Hoạt Động (Nhật ký)</span>

            <!-- Tổ chứa phím chức năng cắm mặt dạt cánh phải -->
            <div style="display: flex; gap: 8px; align-items: center;">
                <button id="${Constants.ID_BTN_COPY_LOG}" class="menu_button qr-log-header-btn" data-i18n="qra_btn_copy">Chép khối</button>
                <button id="${Constants.ID_BTN_DOWNLOAD_LOG}" class="menu_button qr-log-header-btn" data-i18n="qra_btn_download">Tải file</button>
                <button id="${Constants.ID_BTN_CLEAR_LOG}" class="menu_button qr-log-header-btn" style="color: #d32f2f; border-color: rgba(211, 47, 47, 0.3);" data-i18n="qra_btn_clear">Tẩy trắng bóc</button>

                <!-- Lằn phân chẻ khu mạn tàu -->
                <div style="width: 1px; height: 18px; background: #ccc; margin: 0 6px;"></div>

                <!-- Phím chốt sập -->
                <button class="qr-help-close-btn" onclick="document.getElementById('${Constants.ID_MODAL_OVERLAY}').classList.remove('visible')" title="${translate('Đóng', 'qra_title_close')}" style="height: 24px; width: 24px; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-xmark" style="font-size: 18px;"></i>
                </button>
            </div>
        </div>

        <div id="${Constants.ID_LOG_VIEWER}" class="qr-log-viewer"></div>
    </div>`;
}

/**
 * Phết kết cấu vẩy cọ nặn mã HTML Log lấp thẳng vùng chứa
 */
function renderLogsToView(viewerElement) {
    if (!viewerElement) return;

    // Kéo cần gạt tìm cấp độ phễu lọc
    const filterLevel = Logger.currentLevel;

    // Sửa nắn: Lội tìm bằng hàm filter hất đổ Log dưới cấp trước khi tuôn qua map tạo mảng mã HTML
    viewerElement.innerHTML = Logger.logs
        .filter(log => log.level >= filterLevel)
        .map(log => {
            let color = '#333';
            let bgStyle = '';

            if (log.level === LogLevel.ERROR) color = '#d32f2f';
            else if (log.level === LogLevel.WARN) color = '#f57c00';
            else if (log.level === LogLevel.DEBUG) color = '#757575';

            if (log.category === 'Core') {
                color = '#7b1fa2';
                bgStyle = 'background: rgba(123, 31, 162, 0.05); border-left: 3px solid #7b1fa2; padding-left: 8px;';
            }

            const timeStr = `<span style="color: #999; margin-right: 8px;">[${log.timestamp.split('T')[1].replace('Z','')}]</span>`;
            const catStr = `<span style="font-weight:bold; color: ${color}; margin-right: 8px;">[${log.category}]</span>`;

            let dataPart = '';
            if (log.data) {
                try {
                    // Nếu lõi ngầm mớ đống chuỗi Stack do lỗi tạo ra (đã bưng về bởi Logger), xòe bảng kẹp
                    if (log.data.stack) {
                        dataPart = `
                        <div style="margin-top: 4px; font-size: 0.85em; opacity: 0.8;">
                            <details>
                                <summary style="cursor: pointer; text-decoration: underline;">${translate('Hiển thị thông tin chuỗi chồng lỗi (Stack Trace)', 'qra_stack_trace')}</summary>
                                <pre style="white-space: pre-wrap; word-break: break-all; background: rgba(0,0,0,0.1); padding: 5px; border-radius: 4px; margin-top: 5px; font-family: monospace;">${log.data.stack}</pre>
                            </details>
                        </div>`;
                    } else {
                        // Thể thường quy thì tung chuỗi JSON ngắn
                        const jsonStr = JSON.stringify(log.data);
                        // Cắt cúp để khỏi lê thê
                        const displayStr = jsonStr.length > 200 ? jsonStr.substring(0, 200) + '...' : jsonStr;
                        dataPart = `<div style="margin-top: 2px; font-size: 0.85em; opacity: 0.7; font-family: monospace;">Data: ${displayStr}</div>`;
                    }
                } catch (e) {
                    dataPart = `<div style="color: red;">[Dữ liệu Log mắc lỗi hỏng hình]</div>`;
                }
            }

            return `<div style="margin-bottom: 6px; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px; ${bgStyle}">
                ${timeStr}${catStr}<span style="color:${color}">${log.message}</span>
                ${dataPart}
            </div>`;
        }).join('');

    viewerElement.scrollTop = viewerElement.scrollHeight;
}

/**
 * Đốt pháo thắp Bảng Log hiện thân
 */
function showLogModal() {
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    if (!overlay) return;

    overlay.innerHTML = createLogModalHtml();
    overlay.classList.add('visible');

    const viewer = document.getElementById(Constants.ID_LOG_VIEWER);
    renderLogsToView(viewer);

    // Kéo khóa dây kiện phím bấm
    const btnCopy = document.getElementById(Constants.ID_BTN_COPY_LOG);
    if (btnCopy) {
        btnCopy.onclick = () => {
            navigator.clipboard.writeText(Logger.exportLogs()).then(() => {
                const originalText = btnCopy.textContent;
                btnCopy.textContent = translate('Sao chép chót lọt!', 'qra_copied');
                setTimeout(() => btnCopy.textContent = originalText, 1500);
            });
        };
    }

    const btnDownload = document.getElementById(Constants.ID_BTN_DOWNLOAD_LOG);
    if (btnDownload) {
        btnDownload.onclick = () => {
            try {
                // 1. Phết thành bãi chuỗi JSON (Khắc phục căn bằng nấc 2 khoảng trống lề)
                const jsonContent = JSON.stringify(Logger.logs, null, 2);

                // 2. Chế tạo hòn Blob với quy danh loại application/json
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                // 3. Đánh nhãn mác định dạng: qr_helper_logs_2023-10-27T10-00-00.json
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `qr_helper_logs_${timestamp}.json`;

                // 4. Kéo lệnh Tải
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                // 5. Quét dọn tẩy vết
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                Logger.info(LogCategory.SYSTEM, 'Các chuỗi Log đã đúc khuôn kết tinh thành tệp JSON');
            } catch (e) {
                Logger.error(LogCategory.SYSTEM, 'Bất cẩn xảy ra trong tiến trình xuất Log', e);
                toastr.error(translate('Sóng gió khi đúc tệp Log. Mở Console (F12) mà kiểm lỗi.', 'qra_toastr_export_failed'));
            }
        };
    }

    const btnClear = document.getElementById(Constants.ID_BTN_CLEAR_LOG);
    if (btnClear) {
        btnClear.onclick = () => {
            if (confirm(translate('Có xóa nhẵn nhụi bộ ghi chép Log không?', 'qra_confirm_clear_logs'))) {
                Logger.clear();
                renderLogsToView(viewer);
            }
        };
    }
}

// Bơm nhiên liệu móc cắm chấu sự kiện của mục Log cài đặt
function initLogSettings() {
    const logLevelSelect = document.getElementById('qr-log-level-select');
    if (logLevelSelect) {
        logLevelSelect.addEventListener('change', (e) => {
            const level = parseInt(e.target.value);

            // 1. Dập cần mức ranh nấc Log thời gian chạy
            Logger.setLevel(level);

            // 2. Móc túi lưu cố định lại vào Settings
            const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
            settings.logLevel = level;
            saveSettings();

            Logger.info(LogCategory.SYSTEM, `Mực thủy triều của bộ lọc Log được đổi sang: ${e.target.options[e.target.selectedIndex].text}`);

            // Thừa thắng xông lên: Hễ cái khiên Bảng Log đang mở thì cập nhật lẹ tại trận
            const viewer = document.getElementById(Constants.ID_LOG_VIEWER);
            if (viewer && document.getElementById(Constants.ID_MODAL_LOG)) {
                renderLogsToView(viewer);
            }
        });
    }

    const viewLogsBtn = document.getElementById('qr-view-logs-btn');
    if (viewLogsBtn) {
        viewLogsBtn.addEventListener('click', () => {
            showLogModal();
        });
    }

    // Đẩy phím "Tải lẹ Log" ra thẳng màn ngoài của Panel Cài đặt
    const downloadLogsPanelBtn = document.getElementById('qr-download-logs-panel-btn');
    if (downloadLogsPanelBtn) {
        downloadLogsPanelBtn.addEventListener('click', () => {
            try {
                // 1. Phết thành bãi chuỗi JSON (Khắc phục căn bằng nấc 2 khoảng trống lề)
                const jsonContent = JSON.stringify(Logger.logs, null, 2);

                // 2. Chế tạo hòn Blob với quy danh loại application/json
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                // 3. Đánh nhãn mác định dạng: qr_helper_logs_2023-10-27T10-00-00.json
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `qr_helper_logs_${timestamp}.json`;

                // 4. Kéo lệnh Tải
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                // 5. Quét dọn tẩy vết
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                Logger.info(LogCategory.SYSTEM, 'Các chuỗi Log đã đúc khuôn kết tinh thành tệp JSON');
            } catch (e) {
                Logger.error(LogCategory.SYSTEM, 'Bất cẩn xảy ra trong tiến trình xuất Log', e);
                toastr.error(translate('Sóng gió khi đúc tệp Log. Mở Console (F12) mà kiểm lỗi.', 'qra_toastr_export_failed'));
            }
        });
    }
}

// Hàm chia cành phơi dây dẫn mồi kiện thiết lập Log cho cụm setupEventListeners cắn vào 
export function setupLogEventListeners() {
    initLogSettings();
}

// --- Cụm logic thao tác vuốt kéo - Sắp trật tự hàng Menu ---

function createSortModalHtml(settings) {
    const isCustomChecked = settings.enableCustomSort ? 'checked' : '';
    const showDragArea = settings.enableCustomSort ? '' : 'style="display: none;"';
    return `
        <div class="qr-modal-box" id="${Constants.ID_MODAL_SORT}" style="width: 500px; max-width: 95vw; position: relative;">

            <!-- Rập khuôn bóng con che màng của lớp Hướng dẫn UI để quăng cho khối Sắp xếp này dùng -->
            <div id="qr-sort-inner-overlay" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.5); border-radius: 12px; z-index: 50; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
                <div class="qr-modal-box" style="width: 450px; max-width: 90%;">
                    <div class="qr-modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span data-i18n="qra_help_tooltip">Lời nhắc chi tiết chỉ dẫn</span>
                        <button class="qr-help-close-btn" onclick="document.getElementById('qr-sort-inner-overlay').style.display='none'" title="Đóng" data-i18n="[title]qra_title_close" style="color: #333 !important;">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div style="padding: 15px 10px; overflow-y: auto; max-height: 50vh; line-height: 1.6; font-size: 14px; white-space: pre-wrap; color: #333;" data-i18n="qra_sort_desc">Chế độ này cho phép bạn tùy chỉnh thứ tự các nút trên menu QR.
Khi tắt, các nút trên menu QR sẽ tự động sắp xếp (chế độ mặc định).
Khi bật, chúng sẽ hiển thị trên menu QR theo thứ tự dưới đây, vì vậy bạn có thể kéo thả các nhóm nút bên dưới để tự do sắp xếp.

Trong đó, các nút làm mờ bán trong suốt là các script/QR hiện đang bị tắt, còn các nút không mờ là những nút đang được bật.

Vị trí của chúng ở khu vực bên dưới chính là thứ tự bạn sẽ thấy khi mở menu của QR Assistant (khi chế độ sắp xếp tùy chỉnh được bật).

Khi một nút mờ được bật trong chat, nó sẽ xuất hiện trong menu của QR Assistant theo đúng vị trí của nó ở khu vực bên dưới.

Ngoài ra, các nút làm mờ này có thể bị xóa đi. Sau khi xóa, nếu nút đó được bật lại, nó sẽ mặc định xuất hiện ở cuối menu.

Nếu bạn vẫn không hiểu mô tả trên, bạn có thể chụp ảnh màn hình và gửi cho AI để giải thích, hoặc hỏi trong bài viết cộng đồng.</div>
                    <div class="qr-modal-footer">
                        <button class="menu_button primary" data-i18n="qra_btn_read" style="margin: 0 auto;" onclick="document.getElementById('qr-sort-inner-overlay').style.display='none'">Đã xem thông</button>
                    </div>
                </div>
            </div>

            <div class="qr-modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                <span data-i18n="qra_sort_title">Bảng Giao diện Sắp trật tự Vùng Chọn</span>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button id="qr-sort-preview-btn" class="qr-help-close-btn" data-i18n="[title]qra_label_preview" title="Xem chiếu nháp hình trước" style="color: #333 !important;">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="qr-help-close-btn" onclick="document.getElementById('${Constants.ID_MODAL_OVERLAY}').classList.remove('visible')" style="color: #333 !important;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <div style="background: rgba(0,0,0,0.03); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-weight: bold;" data-i18n="qra_sort_enable">Bật hệ tự biên đạo (Customize Sort)</span>
                        <i class="fa-solid fa-circle-question qr-sort-help-toggle" id="${Constants.ID_SORT_HELP_TOGGLE}" style="cursor: pointer; color: #999; font-size: 14px;" data-i18n="[title]qra_help_tooltip" title="Đọc kỹ lời giải trần"></i>
                    </div>
                    <label class="qr-toggle">
                        <input type="checkbox" id="${Constants.ID_SORT_MODE_TOGGLE}" ${isCustomChecked}>
                        <span class="qr-slider"></span>
                    </label>
                </div>
                <div id="qr-sort-inline-desc" style="margin-top: 10px; font-size: 12px; color: #666; white-space: pre-wrap; display: ${!settings.enableCustomSort ? 'block' : 'none'};" data-i18n="qra_sort_inline_desc">Chế độ này cho phép bạn tùy chỉnh thứ tự các nút trên menu QR.
Khi tắt, các nút trên menu QR sẽ tự động sắp xếp (chế độ mặc định).
Khi bật, chúng sẽ hiển thị trên menu QR theo thứ tự dưới đây, vì vậy bạn có thể kéo thả các nhóm nút bên dưới để tự do sắp xếp.
Bạn có thể nhấp vào biểu tượng <i class="fa-solid fa-circle-question"></i> bên trên để xem mô tả chi tiết hơn, và đồng thời khi tùy chỉnh sắp xếp, bạn cũng có thể nhấp vào biểu tượng <i class="fa-solid fa-eye"></i> ở góc trên bên phải để xem trước theo thời gian thực kết quả của việc sắp xếp.</div>
            </div>

            <div class="qr-sort-columns-container" id="qr-sort-columns-container" ${showDragArea}>
                <div class="qr-sort-column">
                    <div class="qr-sort-list" id="qr-sort-list-left" data-col="left"></div>
                </div>
                <div class="qr-sort-column">
                    <div class="qr-sort-list" id="qr-sort-list-right" data-col="right"></div>
                </div>
            </div>
        </div>`;
}

// Bóc mở quyền gọi đối chứng chéo cho nhánh ui.js
window.quickReplyMenu = window.quickReplyMenu || {};
window.quickReplyMenu.openSortModal = openSortModal;

// Tách chức năng cấp ra cho cục index.js mần theo
export function openSortModal() {
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    if (!overlay) return;

    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    if (!settings.groupOrder) settings.groupOrder = { left: [], right: [] };

    overlay.innerHTML = createSortModalHtml(settings);
    overlay.classList.add('visible');

    // Chân cắm bắt nhấp chuột của Nút Xem Chiếu Thử Nháp
    const previewBtn = document.getElementById('qr-sort-preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            // 1. Cuốn chiếu nấp tạm thời cái Bảng Khung điều hướng sắp xếp (Giữ lại mọi biến số sống)
            overlay.style.display = 'none';

            // 2. Chọc lén Nút Khởi Động Rocket để xòe bảng QR (Menu) ra
            const rocketBtn = document.getElementById(Constants.ID_ROCKET_BUTTON);
            if (rocketBtn && !rocketBtn.classList.contains('active')) {
                rocketBtn.click();
            }

            // 3. Phết nặn động một khối Nút "Hủy Tầm Nhìn Xem Nháp" thảy vội vào mép đít Menu
            const menu = document.getElementById(Constants.ID_MENU);
            let exitContainer = null;

            if (menu) {
                // Nhào lặn vỏ bọc đóng gói ngoài cản biên
                exitContainer = document.createElement('div');
                exitContainer.id = 'qr-preview-exit-container';
                exitContainer.style.cssText = 'padding: 12px; display: flex; justify-content: center; align-items: center; border-top: 1px solid var(--qp-border); background: var(--qp-bg); flex-shrink: 0; z-index: 10;';

                // Trổ vóc hình hài Nút bấm lõi
                const exitBtn = document.createElement('button');
                exitBtn.className = 'menu_button primary';
                exitBtn.style.cssText = 'margin: 0; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                // Áp cái tròng Ngữ Pháp dịch ngôn nếu không kẹt lỗi
                exitBtn.textContent = typeof translate === 'function' ? translate('Hủy Xem Trước (Exit Preview)', 'qra_btn_exit_preview') : 'Thoát Xem Trước';

                // Ghim công tắc giật điện sập bảng Menu
                exitBtn.addEventListener('click', () => {
                    if (rocketBtn && rocketBtn.classList.contains('active')) {
                        rocketBtn.click();
                    }
                });

                exitContainer.appendChild(exitBtn);
                menu.appendChild(exitContainer);

                // 4. Móc một trinh sát (Observer) nằm vùng dò hành tung hễ Menu nổ tan biến đi (dù bằng thao tác ấn lung tung nào đi chăng nữa)
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.attributeName === 'class' && !menu.classList.contains('visible')) {
                            // Menu đã thu vòi, lật đật tung lại tấm màn Bảng Sắp xếp ra mặt tiền
                            overlay.style.display = '';

                            // Hủy xác diệt tích cái vỏ Nút Động vứt mạn đít Menu
                            if (exitContainer && exitContainer.parentNode) {
                                exitContainer.parentNode.removeChild(exitContainer);
                            }
                            observer.disconnect(); // Sa thải trinh sát giải tỏa bộ nhớ RAM
                        }
                    });
                });
                observer.observe(menu, { attributes: true });
            } else {
                // Hướng rủi ro, nát bảng Menu thì trực tiếp hiện lại bảng Sắp Xếp cho lành
                overlay.style.display = '';
            }
        });
    }

    // Móc dây gạt của công tắc chế độ Sắp Xếp
    document.getElementById(Constants.ID_SORT_MODE_TOGGLE).addEventListener('change', (e) => {
        settings.enableCustomSort = e.target.checked;
        saveSettings();

        // Mũi nhọn đâm ra màn Hình Mặt Tiền đồng thuận chỉnh dịch chữ Nút
        const mainSortBtn = document.getElementById(Constants.ID_BTN_OPEN_SORT);
        if (mainSortBtn) {
            if (settings.enableCustomSort) {
                mainSortBtn.textContent = translate('Đã bật chế độ sắp xếp tùy chỉnh', 'qra_sort_btn_enabled');
                mainSortBtn.removeAttribute('data-i18n');
            } else {
                mainSortBtn.textContent = translate('Cài đặt', 'qra_btn_settings');
                mainSortBtn.setAttribute('data-i18n', 'qra_btn_settings');
            }
        }

        // Bóp tròng đèn của Nút Xem Chỉ Dẫn (Dấu Hỏi tròn)
        const helpToggle = document.getElementById(Constants.ID_SORT_HELP_TOGGLE);
        if (helpToggle) {
            helpToggle.style.display = settings.enableCustomSort ? 'inline' : 'none';
        }

        // Bóp tròng đèn của Cụm Chữ Tường Trình Kẹp Trong Bảng
        const inlineDesc = document.getElementById('qr-sort-inline-desc');
        if (inlineDesc) {
            inlineDesc.style.display = !settings.enableCustomSort ? 'block' : 'none';
        }

        // Hiện nguyên khung Vuốt-Lôi Sắp Xếp
        const dragContainer = document.getElementById('qr-sort-columns-container');
        if (dragContainer) {
            dragContainer.style.display = settings.enableCustomSort ? 'flex' : 'none';
        }

        // Nếu khai nòng Sắp Xếp rồi thì bốc số chép Khung Group
        if (settings.enableCustomSort) {
            renderSortLists(settings);
        }
    });

    // Phát Bảng Hướng Dẫn Sắp Xếp bằng Dấu Hỏi
    const helpToggle = document.getElementById(Constants.ID_SORT_HELP_TOGGLE);
    if (helpToggle) {
        helpToggle.style.display = settings.enableCustomSort ? 'inline' : 'none';
        helpToggle.addEventListener('click', () => {
            const innerOverlay = document.getElementById('qr-sort-inner-overlay');
            if (innerOverlay) {
                innerOverlay.style.display = 'flex';
            }
        });
    }

    // Luôn nhồi vẽ ngay từ đầu hễ Sắp Xếp Dân Độ được khai quang
    if (settings.enableCustomSort) {
        renderSortLists(settings);
    }
}

// --- Mắt thần Quét Lõi Bộ Nhớ Ngầm ---
// Cốt tủy: Xẻ dọc bẻ mành xuyên tủng các Nút Dù nằm dạng Ẩn hay Nấp kẹp chết trong Hầm Đáy các Biến Tavern.
function scanAllMemoryForButtons() {
    const resultMap = new Map();
    const stContext = window.SillyTavern?.getContext();

    const addBtn = (groupName, label) => {
        if (!groupName || !label) return;
        if (!resultMap.has(groupName)) resultMap.set(groupName, new Set());
        resultMap.get(groupName).add(label);
    };

    // 1. Phóng tầm dò QR V2 (Sốc vô cả đống đã liệt kê vào màng Hidden bốc trần ra hết)
    if (window.quickReplyApi?.settings) {
        const scanQr = (setList) => {
            if (!Array.isArray(setList)) return;
            setList.forEach(link => {
                if (link?.set?.name && Array.isArray(link.set.qrList)) {
                    link.set.qrList.forEach(qr => {
                        if (qr.label) addBtn(link.set.name, qr.label.trim());
                    });
                }
            });
        };
        scanQr(window.quickReplyApi.settings.config?.setList);
        scanQr(window.quickReplyApi.settings.chatConfig?.setList);
        scanQr(window.quickReplyApi.settings.charConfig?.setList);
    }

    // 2. Chĩa ống dòm sang LWB / LittleWhiteBox - Tiểu Bạch X (Bới cả lũ Task chốt vĩnh viễn Disabled)
    if (window.XBTasks) {
        const getTasks = (source) => Array.isArray(source) ? source : [];
        getTasks(window.XBTasks.global).forEach(t => { if (t.name) addBtn(`LWB-global-${t.name}`, t.name.trim()); });
        getTasks(window.XBTasks.preset).forEach(t => { if (t.name) addBtn(`LWB-preset-${t.name}`, t.name.trim()); });

        let currentCharName = "Character";
        if (stContext?.characterId && stContext.characters) {
            currentCharName = stContext.characters[stContext.characterId]?.name || "Character";
        }
        getTasks(window.XBTasks.character).forEach(t => { if (t.name) addBtn(currentCharName, t.name.trim()); });
    }

    // 3. Quét tát vét bùn Đáy Bể Nhân Vật Tavern (Tróc xương Moi xác luôn cục Nút Riêng Bị Ẩn)
    if (stContext?.characters) {
        stContext.characters.forEach(char => {
            const exts = char.data?.extensions || {};

            // Moi Nút Ngầm LWB ở thằng Nhân vật lân cận
            if (Array.isArray(exts.XBTasks)) {
                exts.XBTasks.forEach(t => {
                    if (t.name) addBtn(char.name, t.name.trim());
                });
            }

            // Moi QRv2 cục cưng của Nhân Vật kề bên (Chuẩn bị súng đạn rà cho đủ dòng biến gán tên)
            const qrData = exts['quick-reply'] || exts['ch_quick_reply'] || exts['qr'];
            if (qrData) {
                const setList = Array.isArray(qrData) ? qrData : (Array.isArray(qrData.setList) ? qrData.setList : null);
                if (setList) {
                    setList.forEach(setObj => {
                        const set = setObj.set || setObj; // Đỡ gãy cấu trúc bất đồng
                        if (set.name && Array.isArray(set.qrList)) {
                            set.qrList.forEach(qr => {
                                if (qr.label) addBtn(set.name, qr.label.trim());
                            });
                        }
                    });
                }
            }
        });
    }

    return resultMap;
}

// --- Dùng hàm này cướp ngôi renderSortLists (Sáng thế bản nháp cũ) ---
function renderSortLists(settings) {
    // 1. Kéo bọc Mảng Nút có mặt Sống tại Giao Diện
    const { scripts, standard } = fetchQuickReplies();
    const whitelist = Array.isArray(settings.whitelist) ? settings.whitelist : [];

    // Chặn Vùng Trắng: Ai chui danh sách Danh Sách Trắng WhiteList thì cấm được điểm danh vào đây Sắp Xếp
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
    const isWhitelisted = (item) => {
        const id = generateId(item);
        return id && whitelist.includes(id);
    };

    const groupDataMap = new Map();
    const allItems = [...scripts, ...standard].filter(item => !isWhitelisted(item));
    allItems.forEach(item => {
        if (item.setName) {
            if (!groupDataMap.has(item.setName)) {
                groupDataMap.set(item.setName, []);
            }
            groupDataMap.get(item.setName).push(item);
        }
    });

    // 2. Chạy Cỗ Máy Trinh Sát Lõi Bể Dữ Liệu Ngầm, gắp xác các Mảnh Nút Ma 
    const memoryScannerMap = scanAllMemoryForButtons();

    // 3. Tế Bần Khống Cư Cú (Mồ côi): Có Mảnh Group nào lạ mới bốc vào nhồi chèn bọc lót Đít Danh sách
    groupDataMap.forEach((items, name) => {
        if (!settings.groupOrder.left.includes(name) && !settings.groupOrder.right.includes(name)) {
            const isScript = items.some(item => item.source === 'JSSlashRunner' || item.source === 'LittleWhiteBox');
            if (isScript) settings.groupOrder.left.push(name);
            else settings.groupOrder.right.push(name);
        }
    });

    // 4. Viết mã Vẩy Mực Khung Cột Liệt Kê
    const renderList = (colId, listKey) => {
        const listEl = document.getElementById(colId);
        listEl.innerHTML = '';

        settings.groupOrder[listKey].forEach(name => {
            const groupItems = groupDataMap.get(name) || [];
            const isActive = groupItems.length > 0;

            // Xử lý xác Mảnh Nút Ma (Nếu có bốc thì ẵm từ kết quả Memory)
            let ghostItems = [];
            if (!isActive && memoryScannerMap.has(name)) {
                ghostItems = Array.from(memoryScannerMap.get(name)).map(label => ({ label }));
            }

            // Bấm quẻ chốt Cục Khối Hạt Số Lượng đếm 
            const displayCount = isActive ? groupItems.length : ghostItems.length;

            // Nặn Thân Khung Vỏ Vùng Group
            const groupContainer = document.createElement('div');
            groupContainer.className = 'qr-sort-group';
            if (!isActive) groupContainer.classList.add('ghost');

            // Xẻ Đầu Mục Vùng Group (Chỗ để bấm bấu kéo lôi đi)
            const headerEl = document.createElement('div');
            headerEl.className = 'qr-sort-group-header';
            headerEl.draggable = true;
            headerEl.dataset.name = name;

            const itemCount = displayCount > 0 ? `<span class="qr-sort-item-count">${displayCount}</span>` : '';

            // Hóa Cảnh LWB đúc khuôn Đồng Bộ Tên Thân Trắng
            let displayName = name;
            const isLwbActive = groupItems.some(item => item.source === 'LittleWhiteBox');

            if (isLwbActive) {
                const firstLwbItem = groupItems.find(item => item.source === 'LittleWhiteBox');
                if (firstLwbItem.isLwbCharSet) {
                    displayName = `小白X-${name}`;
                } else {
                    displayName = `小白X-${firstLwbItem.taskId}`;
                }
            } else {
                if (name.startsWith('LWB-global-')) {
                    displayName = `小白X-${name.replace('LWB-global-', '')}`;
                } else if (name.startsWith('LWB-preset-')) {
                    displayName = `小白X-${name.replace('LWB-preset-', '')}`;
                }
            }

            const delBtnHtml = !isActive ? `<button class="qr-sort-del-btn" title="${translate('Xóa bỏ Bản Ghi (Record)', 'qra_sort_del_record')}"><i class="fa-solid fa-trash-can"></i></button>` : '';

            headerEl.innerHTML = `
                <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                    <i class="fa-solid fa-grip-lines qr-sort-drag-handle"></i>
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:bold;">${displayName}</span>
                    ${itemCount}
                </div>
                ${delBtnHtml}
                <button class="qr-sort-expand-btn" title="${translate('Mở bung / Xếp gọn', 'qra_sort_expand_collapse')}">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            `;

            // 【Gỡ Nút Kẹt Bug】Tra mỡ bôi trơn bắt dính Nút Thùng Rác của Các Xác Nút Ma Mồ Côi
            const delBtn = headerEl.querySelector('.qr-sort-del-btn');
            if (delBtn) {
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    const arr = settings.groupOrder[listKey];
                    const idx = arr.indexOf(name);
                    if (idx > -1) arr.splice(idx, 1);
                    groupContainer.remove();
                    saveSettings();
                };
            }

            // Gắn Khúc Nút Kéo Sổ Bung/Thun Vào
            const expandBtn = headerEl.querySelector('.qr-sort-expand-btn');
            const contentEl = document.createElement('div');
            contentEl.className = 'qr-sort-group-content';
            contentEl.style.display = 'none'; // Giấu kín mặc định 

            expandBtn.onclick = (e) => {
                e.stopPropagation();
                const isExpanded = contentEl.style.display !== 'none';
                contentEl.style.display = isExpanded ? 'none' : 'block';
                expandBtn.querySelector('i').className = isExpanded ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
            };

            // --- Quét rải Khối Nút Nội Tạng ---
            const itemsToRender = isActive ? groupItems : ghostItems;

            if (itemsToRender.length > 0) {
                itemsToRender.forEach(item => {
                    const btnEl = document.createElement('div');
                    btnEl.className = 'qr-sort-group-item';

                    // Cạo phai màu, đục khung cho Lũ Nút Ma Nháp (Bản Không Sống/Disable)
                    if (!isActive) {
                        btnEl.style.opacity = '0.6';
                        btnEl.style.background = '#f9f9f9';
                    }

                    btnEl.innerHTML = `<span>${item.label || item.name || 'Unknown'}</span>`;
                    contentEl.appendChild(btnEl);
                });
            } else {
                contentEl.innerHTML = `<div style="padding:10px; text-align:center; color:#999; font-size:12px;">${translate('Nhóm Vùng Này chả thấy bốc ra mống Khối Nút Hữu Hiệu nào sót trong Tâm Mạch Tavern', 'qra_sort_group_empty')}</div>`;
            }

            groupContainer.appendChild(headerEl);
            groupContainer.appendChild(contentEl);
            listEl.appendChild(groupContainer);

            // Bủa lưới dăng bẫy bắt dính cơ màng Lôi/Vồ (Drag) quấn lấy Cổ Khung Đầu
            bindDragEvents(headerEl, groupContainer);
        });

        // Áp chế Không Cột Trống rỗng cũng có Mảng Từ Trường tiếp ứng bám dính Nút Drag
        listEl.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingGroup = document.querySelector('.qr-sort-group.dragging');
            if (draggingGroup && !listEl.contains(draggingGroup)) {
                listEl.appendChild(draggingGroup);
            }
        });
    };

    renderList('qr-sort-list-left', 'left');
    renderList('qr-sort-list-right', 'right');
}

let draggedItem = null;
let draggedGroup = null;

function bindDragEvents(headerEl, groupContainer) {
    // ==================================================
    // 1. Phép Mầu Drag Kéo của Desktop Chuột Cơ HTML5 (Giữ nguyên Tinh Nghĩa Cũ)
    // ==================================================
    headerEl.addEventListener('dragstart', (e) => {
        draggedItem = headerEl;
        draggedGroup = groupContainer;

        // Trục lấp kẽ hở chí tử: Bắt nhịp trì hoãn đắp Class Dragging.
        // Khối Drag chuẩn HTML5 nổ máy ngay phát giật Cốp lấy bóng mờ.
        // Gài trễ xíu để máy duyệt Web tráng bóng chụp ảnh nguyên thủy trước khi màng Ảo Ảnh kịp tụ thành Không Tàng Hình.
        setTimeout(() => {
            if (draggedGroup) draggedGroup.classList.add('dragging');
        }, 0);

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        }
    });

    headerEl.addEventListener('dragend', () => {
        if (draggedGroup) draggedGroup.classList.remove('dragging');
        draggedItem = null;
        draggedGroup = null;
        saveSortOrderFromDOM();
    });

    // Mũi giáo đắc dụng Trục Hở: Nới rộng Vùng Điểm Rơi Bắt Đáp. Đè thẳng vào Khung Tổ Thay Vì Máng Đầu Mái Ngói headerEl, lực hút sẽ dính bén mượt mà vô hạn.
    groupContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (groupContainer === draggedGroup || !draggedGroup) return;

        const listEl = groupContainer.parentNode;
        const rect = groupContainer.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        try {
            if (e.clientY < midpoint) {
                listEl.insertBefore(draggedGroup, groupContainer);
            } else {
                listEl.insertBefore(draggedGroup, groupContainer.nextSibling);
            }
        } catch (err) {}
    });

    // ==================================================
    // 2. Chế Tạo Màng Lưới Phép Mới - Chiếm Quyền Cai Quản Touch ĐTDĐ thuần JS
    // ==================================================
    let touchTimer = null;
    let isTouchDragging = false;
    let startY = 0;
    let startX = 0;
    let cloneEl = null;

    headerEl.addEventListener('touchstart', (e) => {
        // Đỡ đòn bấm hụt trượt qua Cụm Nút Xóa / Bành trướng 
        if (e.target.closest('button')) return;

        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        // Đúc neo dằn 300 mili giây Nhấn Lún để Phân định Rạch Ròi Vuốt Lướt Trượt và Nhấc Lên Lôi Kéo
        touchTimer = setTimeout(() => {
            isTouchDragging = true;
            draggedItem = headerEl;
            draggedGroup = groupContainer;
            groupContainer.classList.add('dragging');

            // 1. Phép Độn Hồn Cắt Bóng Bám Ngón Tay
            cloneEl = groupContainer.cloneNode(true);
            cloneEl.classList.remove('dragging');
            cloneEl.classList.add('qr-sort-drag-clone');

            // Định Vị Chết Tâm Bản Thể Ban Sơ
            const rect = groupContainer.getBoundingClientRect();
            cloneEl.style.width = `${rect.width}px`;
            cloneEl.style.left = `${rect.left}px`;
            cloneEl.style.top = `${rect.top}px`;
            document.body.appendChild(cloneEl);

            // Rùng mình hồi chuông nhỏ tống phản lực (Vibration Mobile)
            if (navigator.vibrate) navigator.vibrate(50);
        }, 300);
    }, { passive: true });

    headerEl.addEventListener('touchmove', (e) => {
        if (!isTouchDragging) {
            // Sẩy ngón xô ngang lỡ chót quá Trớn Dài, xóa lệnh kết ấn Khởi Kéo
            if (Math.abs(e.touches[0].clientY - startY) > 10 || Math.abs(e.touches[0].clientX - startX) > 10) {
                clearTimeout(touchTimer);
            }
            return;
        }

        // Chặn Luồng Tự Cuộn Nền Lăn của Trình Duyệt Máy
        if (e.cancelable) e.preventDefault();

        const touch = e.touches[0];

        // 2. Phù Phép Định Hướng Kéo Bóng Phân Thân (Xài Kháng Mạch Xoắn Transform Ép GPU Nuột Nà Bậc Nhất)
        if (cloneEl) {
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            cloneEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
        }

        // 3. Phép Tẩy Hồn Đổi Vị Siêu Cấp: Ném Tròng Trắng visibility Lên Đè Bẹp Lệnh Trốn Thoát display: none
        // Nhờ thế, Băng Khối xác thịt gốc vẫn đè chiếm Không Gian móng ngói, dàn dưới không Tụt Lở văng ngược lên Bơm giật Khung. Xóa tan tận rễ Vụ Nháy Giật Nhảy Bậc.
        groupContainer.style.visibility = 'hidden';
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        groupContainer.style.visibility = '';

        if (!target) return;

        // 4. Bảo chứng Cầu Chì Anti-Crash Cấp Đỉnh: Đảm Bất Trắc Chống Cháy Đám Mây Mảnh Văng DOM Đứt Đoạn Lạc Trôi
        if (!draggedGroup || !draggedGroup.parentNode) return;

        const targetHeader = target.closest('.qr-sort-group-header');
        if (targetHeader && targetHeader !== headerEl) {
            // Va trúng sườn chóp mục Đầu Mục khác, chia phép đo nạc Chẻ Ngôi Vị chen đè qua mặt
            const targetGroup = targetHeader.closest('.qr-sort-group');
            const listEl = targetGroup.parentNode;
            const rect = targetHeader.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;

            try {
                if (touch.clientY < midpoint) {
                    listEl.insertBefore(draggedGroup, targetGroup);
                } else {
                    listEl.insertBefore(draggedGroup, targetGroup.nextSibling);
                }
            } catch (err) {
                // Ém Nhẹp Đóng Nắp Hũ Che Giấu Nốt Các Cực Hạn Xác Suất Nghẽn Ren DOM Kỳ Dị
            }
        } else {
            // Va lọt qua lổ mẻ Mạn Hông rỗng của Vách Trống Khác (Lướt Xuyên Bảng Dòng)
            const targetList = target.closest('.qr-sort-list');
            if (targetList && !targetList.contains(draggedGroup)) {
                try {
                    targetList.appendChild(draggedGroup);
                } catch (err) {}
            }
        }
    }, { passive: false });

    const endTouchDrag = () => {
        clearTimeout(touchTimer);
        if (isTouchDragging) {
            isTouchDragging = false;
            groupContainer.classList.remove('dragging');

            // 5. Thổi tro Cúng Hồn Phân Thân Ám Ảo Bay Cháy Hủy Diệt
            if (cloneEl) {
                cloneEl.remove();
                cloneEl = null;
            }

            draggedItem = null;
            draggedGroup = null;
            saveSortOrderFromDOM();
        }
    };

    headerEl.addEventListener('touchend', endTouchDrag);
    headerEl.addEventListener('touchcancel', endTouchDrag);
}

function saveSortOrderFromDOM() {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];

    const getNames = (colId) => {
        const groups = document.querySelectorAll(`#${colId} .qr-sort-group`);
        return Array.from(groups).map(el => el.querySelector('.qr-sort-group-header').dataset.name);
    };

    settings.groupOrder.left = getNames('qr-sort-list-left');
    settings.groupOrder.right = getNames('qr-sort-list-right');
    saveSettings();
}

// --- Khối Hàm Nổi Lên Thông Cáo Báo Đại Sảnh ---
function createAnnouncementModalHtml() {
    const lang = getCurrentLocale();
    const content = announcementDocs[lang] || announcementDocs['en'] || announcementDocs['zh-cn'];

    return `
    <div class="qr-modal-box" id="${Constants.ID_MODAL_ANNOUNCEMENT}">
        <div style="padding: 10px 15px; overflow-y: auto; max-height: 50vh; color: #000; line-height: 1.6; font-size: 14px;">
            ${content}
        </div>
        <div class="qr-modal-footer">
            <button id="${Constants.ID_BTN_CLOSE_ANNOUNCEMENT}" class="menu_button primary" data-i18n="qra_btn_read">Đã Đọc Hiểu</button>
        </div>
    </div>`;
}

export function showAnnouncementModalIfNeeded() {
    const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
    const ANNOUNCEMENT_KEY = 'announcement_read_20260428';

    // Đọc trôi êm xuôi qua rồi thì Thôi Bỏ Kế Tiết Bỏ Mặc Qua Bên
    if (settings[ANNOUNCEMENT_KEY]) return;

    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    if (!overlay) return;

    // Giương lều đúc bệ chiếu nặn Khung
    overlay.innerHTML = createAnnouncementModalHtml();
    overlay.classList.add('visible');

    // Chớp mặt Trình Diện Khung Đồng nghĩa Bấm mộc Lỗ Thủng Chốt Bằng cờ True chìm ngầm
    // Cứu mạng Dân chơi không Chịu Click Tắt mà F5 thì bảng Báo Mộng này Không Quay về Làm Ám Ảnh lại Nữa
    settings[ANNOUNCEMENT_KEY] = true;
    saveSettings();

    // Tưới lại lớp Sơn Ngôn Ngữ, Cục Nút "Đã Đọc" biến thân theo Hệ Chữ Gốc App
    import('../../../i18n.js').then(({ applyLocale }) => {
        if (typeof applyLocale === 'function') applyLocale();
    });

    // Cắm móc cài Xóa Che Sập Tắt Bảng
    const btnClose = document.getElementById(Constants.ID_BTN_CLOSE_ANNOUNCEMENT);
    if (btnClose) {
        btnClose.onclick = () => {
            overlay.classList.remove('visible');
        };
    }
}

// --- Góc Khai Đất Cắm Biển Bảng Giải Mã Trợ Giúp Phân Thân Từng Thiết Lập Đơn Lẻ ---
function createSettingHelpModalHtml(helpKey) {
    let titleI18n = '';
    let defaultTitle = '';
    let contentI18n = '';
    let defaultContent = '';

    if (helpKey === 'autoshrink') {
        titleI18n = 'qra_card_autoshrink_title';
        defaultTitle = 'Tự động thu gọn nút';
        contentI18n = 'qra_setting_help_autoshrink';
        defaultContent = 'Sau khi bật tính năng này, tiện ích sẽ tự động thu gọn tất cả các nút ở khu vực phía trên khung nhập liệu chat.\n\nVà khi bạn rê chuột tới hoặc nhấn vào khung nhập liệu thì chúng sẽ tự động mở lại để hiển thị mọi nút.\n\nTính năng này có thể phối hợp nhịp nhàng với tính năng Danh Sách Trắng, bởi vì chỉ các Nút nằm bên trong Danh Sách Trắng (Hoặc Khối Nút Công Cụ Nhập Liệu) mới lơ lửng tồn đọng hiện hành ngự trên hộp nhập. Các bạn nào khi xài QR Assistant mà không xài Danh Sách Trắng hay Nút Nhập Liệu thì tắt luôn nó cho khỏi lướng vướng sinh thừa.';
    } else if (helpKey === 'backdrop') {
        titleI18n = 'qra_card_backdrop_title';
        defaultTitle = 'Hiệu ứng làm mờ nền';
        contentI18n = 'qra_setting_help_backdrop';
        defaultContent = 'Sau khi tính năng này bật lên, mỗi lần bạn click con biểu tượng QR Assistant nằm tuốt luốt góc phải sát vách mép hộp gửi để bung Menu, toàn thể Phông Nền Phía Dưới Lưng Bảng Panel sẽ phủ một tấm màng sương mù làm nhòe lấp vệt xóa nhòa ảnh (Blur effect).\n\nNôm na cũng cỡ việc bạn ấn Điện Thoại trượt ra dạt Hậu Cảnh Ngoài, tấm áo Desktop chìm trong lớp nhòe Blur Kính Mờ vậy. Ý Nghĩa Cốt Bán của Tính Năng này sẽ đục chìm hình dạng Nền Hậu Cảnh Sau để đánh lóa làm nhòe Mờ Ảo Tựa Màn Kính Mờ.\n\nChính vì lý do đó, mục đích của việc kích Mở Tính năng này nhằm cứu mắt bạn thoát khỏi sự rối rắm, nhiễu loạn thị giác (Đề Cử Kích Hoạt Tính Năng Này Lên).';
    } else if (helpKey === 'combined') {
        titleI18n = 'qra_card_combined_title';
        defaultTitle = 'Gộp Phản hồi nhanh';
        contentI18n = 'qra_setting_help_combined';
        defaultContent = 'Gạt công tắc tính năng này thì hằng hà sa số đám Nút ở trên nóc Khung Nhập sẽ dồn cục dính chùm chen chúc kề sát xạt vào nhau. Chúng sẽ không bị cô lập một dòng chia lẻ riêng biệt làm đứt gãy đội hình.\n\nTính Năng này là tay vịn kề sát phối kết Đôi Nhịp Cùng Mảnh Tính Năng Danh Sách Trắng. Bởi Vốn chỉ Đám Nút bị nhốt trong Vòng Danh Sách Trắng mới có Vé Ló Đầu Tồn Tại Ngự Trên Khung Hộp Nhập Liệu.\n\nNguyên lai hình hài cội rễ thì Cái Nút Công Tắc này Chính là sao y bản chính nguyên cục Nút Công Tắc "Gộp Phản Hồi Nhanh" của Phản Hồi Nhanh Nội Tại Gốc Quán Rượu, Bản Chất y Đúc chả Khác 1 Li (Mọi người Gạt Tắt/Mở ở Khung Phản Hồi Nhanh Gốc hay Kéo ở ngay bên Cài Đặt của Phụ Bản QR Assistant này đều Ăn Khớp Nhịp Nhàng Khai Đóng Liên Kết Xuyên Suốt Lẫn Nhau).\n\nCó nó đặt thò lò ra tại phần Cài đặt Của QR Assistant chủ ý Giúp Các bạn Ấn Cho Đỡ Vướng, Tiện Tay Nhanh Gọn.';
    } else if (helpKey === 'sort') {
        titleI18n = 'qra_card_sort_title';
        defaultTitle = 'Sắp xếp nút trên menu';
        contentI18n = 'qra_setting_help_sort';
        defaultContent = 'Mở tính năng này, bộ Hàng Nút ngụ ở Menu QR Assistant sẽ nghe theo Lệnh Triệu Hoán Thứ Tự Do bạn Sắp Đặt Rành Rọt.\n\nMặc Định thì Nút Bấm Khóa Kín. Hễ Bị Khóa Kín Tắt Ngỏm thì Mảng Logic Lập Trình trong Bụng Plugin này sẽ Gánh Vai Trò Tự Động Định Hình Thứ Bậc Dàn Nút Hàng Lối Trên Menu Tùy Nghi.\n\nKhối Logic Tự Động Xếp Hàng Hóa ra lại Trúng Tim Đen Ăn Khớp Tâm Ý Đám Đông Ngôn Ngữ Hành Vi Chung Của Người Dùng Lâu Năm Nhất, xài là cũng đủ mượt mà lắm rồi. Cố nhiên, Luôn Trải Thảm Trọng Vọng Mời Bạn Lôi Theo Phong Cách Riêng Tự Biên Tự Diễn Xếp Hình Sắp Xếp.\n\nTính Năng Này Mà Chạy Thông Lên Thì Ngay Tại Chữ Nút Cạnh Chót Khóa Tính Năng Đó Nó Hiện Hẳn Ra Cụm Câu: "Đã Bật Chế Độ Sắp Xếp Tùy Chỉnh".';
    }

    return `
    <div class="qr-modal-box" id="${Constants.ID_MODAL_SETTING_HELP}" style="max-width: 500px;">
        <div class="qr-modal-header" style="display: flex; justify-content: space-between; align-items: center;">
            <span data-i18n="${titleI18n}">${defaultTitle}</span>
            <button class="qr-help-close-btn" onclick="document.getElementById('${Constants.ID_MODAL_OVERLAY}').classList.remove('visible')" title="Đóng bảng hiển thị" data-i18n="[title]qra_title_close" style="color: #333 !important;">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div style="padding: 15px 10px; overflow-y: auto; max-height: 50vh; line-height: 1.6; font-size: 14px; white-space: pre-wrap; color: #333;" data-i18n="${contentI18n}">${defaultContent}</div>
        <div class="qr-modal-footer">
            <button id="${Constants.ID_BTN_CLOSE_SETTING_HELP}" class="menu_button primary" data-i18n="qra_btn_read" style="margin: 0 auto;">Đã Đọc và Thông Suốt</button>
        </div>
    </div>`;
}

function openSettingHelpModal(helpKey) {
    const overlay = document.getElementById(Constants.ID_MODAL_OVERLAY);
    if (!overlay) return;

    overlay.innerHTML = createSettingHelpModalHtml(helpKey);
    overlay.classList.add('visible');

    // Chạy lại cỗ máy thông dịch (Tránh lỡ dịp ngôn ngữ chưa kịp phủ vỏ bọc lên khung mới đúc)
    import('../../../i18n.js').then(({ applyLocale }) => {
        if (typeof applyLocale === 'function') applyLocale();
    });

    const btnClose = document.getElementById(Constants.ID_BTN_CLOSE_SETTING_HELP);
    if (btnClose) {
        btnClose.onclick = () => {
            overlay.classList.remove('visible');
        };
    }
}
