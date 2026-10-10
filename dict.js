// dict.js - Tệp từ điển i18n
// Tất cả các Key sử dụng tiền tố qra_, để tránh xung đột với văn bản gốc của SillyTavern

export const dictionaries = {
    'en': {
        // === Thẻ Tab ===
        'qra_tab_main': 'Main Settings',
        'qra_tab_whitelist': 'Whitelist',
        'qra_tab_icon': 'Button Icon',

        // === Trang cài đặt chính ===
        'qra_label_version': 'Version',
        'qra_btn_check_update': 'Check for Updates',
        'qra_opt_enable': 'Enable extension',
        'qra_opt_disable': 'Disable extension',
        'qra_label_ui_theme': 'UI Theme',
        'qra_theme_default': 'Default',
        'qra_theme_system': 'Follow System',
        'qra_theme_sakura': 'Sakura',
        'qra_theme_classical': 'Classical',
        'qra_theme_dark': 'Dark',
        'qra_theme_paper': 'Washi (Paper)',
        'qra_theme_ceramic': 'White Porcelain',
        'qra_theme_lavender': 'Lavender',
        'qra_theme_smoked': 'Smoked',
        'qra_theme_aurora': 'Aurora',
        'qra_theme_forest': 'Misty Forest',

        // Tiêu đề Thẻ (Card)
        'qra_card_autoshrink_title': 'Auto-Hide Buttons',
        'qra_card_autoshrink_desc': 'Auto-hide the button bar above the chat input',
        'qra_card_backdrop_title': 'Background Blur',
        'qra_card_backdrop_desc': 'Apply a frosted glass blur effect behind the menu',
        'qra_card_combined_title': 'Merge Quick Replies (QR v2)',
        'qra_card_combined_desc': 'Merge all separate Quick Reply panels into one (Syncs with QR v2)',
        'qra_card_sort_title': 'Button Sorting',
        'qra_card_sort_desc': 'Customize the order of menu buttons',
        'qra_card_help_title': 'Usage Guide',
        'qra_card_help_desc': 'View detailed feature descriptions and help',
        'qra_card_log_title': 'System Logs',
        'qra_card_log_desc': 'View extension status, troubleshoot issues, or export logs',

        'qra_btn_settings': 'Settings',
        'qra_btn_open': 'Open',

        // Nhật ký
        'qra_log_level_debug': 'DEBUG (All)',
        'qra_log_level_info': 'INFO (Normal)',
        'qra_log_level_warn': 'WARN (Warnings Only)',
        'qra_log_level_error': 'ERROR (Errors Only)',
        'qra_btn_view_logs': 'View Logs',
        'qra_btn_download_logs': 'Download Logs',

        // === Trang Danh sách trắng ===
        'qra_whitelist_hidden': 'Hidden List',
        'qra_whitelist_visible': 'Whitelist (Visible)',
        'qra_whitelist_help_p1': 'Click any entry in the lists above to move it between the two lists.',
        'qra_whitelist_help_p2': 'Items in the Whitelist will remain above the chat input bar, while items in the Hidden List will appear inside the QR Assistant menu instead.',
        'qra_whitelist_help_p3': 'On mobile, long-press any QR or script entry to view its source and scope.',
        'qra_whitelist_help_p4': 'Icons: <i class="fa-solid fa-sun"></i> = LittleWhiteBox script, <i class="fa-solid fa-star"></i> = Quick Reply, <i class="fa-solid fa-moon"></i> = JSR script, <i class="fa-solid fa-puzzle-piece"></i> = SiilyTavern extension.',

        // === Trang Cài đặt biểu tượng ===
        'qra_icon_source_builtin': 'Built-in Icons',
        'qra_icon_source_character': 'Current Character Card',
        'qra_icon_source_custom': 'Custom Icons',

        // Tên biểu tượng tích hợp
        'qra_icon_rocket': 'Rocket',
        'qra_icon_bolt': 'Hexagram',
        'qra_icon_comment': 'Palette',
        'qra_icon_star': 'Star & Crescent',
        'qra_icon_fan': 'Pinwheel',
        'qra_icon_pencil': 'Pencil',
        'qra_icon_book': 'Book',
        'qra_icon_mug': 'Hot Coffee',
        'qra_icon_crown': 'Crown',
        'qra_icon_gem': 'Diamond',
        'qra_icon_headphones': 'Headphones',

        'qra_label_btn_icon': 'Button Icon',
        'qra_label_preview': 'Preview',
        'qra_label_icon_size': 'Icon Size',
        'qra_opt_size_match': 'Match Send Button Size',
        'qra_opt_size_custom': 'Custom Icon Size',
        'qra_label_size_em': 'Size (em)',

        'qra_char_desc': 'Use the current character\'s avatar as the button icon. Updates automatically when switching chats.',
        'qra_char_no_avatar': 'No Character Avatar',
        'qra_char_avatar_rotation': 'Enable Avatar Rotation Animation',

        'qra_custom_placeholder': '-- Select or Add --',
        'qra_custom_no_icon': 'No Icon',
        'qra_btn_manage_icons': 'Manage Icons',
        'qra_btn_add_icon': 'Add Icon',

        // === Popup (Modal) ===
        'qra_modal_manage_title': 'Manage Custom Icons',
        'qra_modal_add_title': 'Add Custom Icon',
        'qra_modal_edit_title': 'Edit Icon',
        'qra_label_name': 'Name',
        'qra_label_icon_url': 'Icon URL',
        'qra_link_image_host': 'Free Image Host',
        'qra_label_icon_size_hint': 'Icon size (default 1.2 means matching the send button size. Do not change unless you want to force a larger or smaller icon):',
        'qra_placeholder_name': 'e.g. Paimon',
        'qra_placeholder_url': 'Enter image hosting URL',
        'qra_btn_save': 'Save',
        'qra_btn_cancel': 'Cancel',
        'qra_btn_save_changes': 'Save Changes',
        'qra_btn_back': 'Back',
        'qra_btn_close': 'Close',
        'qra_no_saved_icons': 'No saved icons',

        // Xác nhận/Thông báo
        'qra_confirm_delete_icon': 'Are you sure you want to delete this icon?',
        'qra_alert_name_url_required': 'Name and URL cannot be empty',
        'qra_alert_url_required': 'Please enter an icon URL',
        'qra_confirm_update': 'The update will refresh the page. Make sure you have saved your conversation.\nProceed with update?',
        'qra_alert_update_sent': 'Update command sent. The page will refresh shortly.',
        'qra_alert_update_failed': 'Update failed. Check the console for details.',
        'qra_alert_update_error': 'Update request error: ',
        'qra_confirm_clear_logs': 'Are you sure you want to clear all logs?',
        'qra_toastr_export_failed': 'Failed to export logs. Check console for details.',

        // Liên quan đến cập nhật
        'qra_checking': 'Checking...',
        'qra_up_to_date': 'Up to Date',
        'qra_new_version_found': 'New Version Found',
        'qra_check_failed': 'Check Failed',
        'qra_btn_check_update': 'Check for Updates',
        'qra_label_current_version': 'Version',

        // Popup cập nhật
        'qra_modal_update_title': 'extension Update Log',
        'qra_update_tip': 'If the update fails, you can manually update QR Assistant from the Extensions management page. If it still fails, try deleting and reinstalling the extension.',
        'qra_btn_update_now': 'Update Now',
        'qra_loading_changelog': 'Loading changelog...',
        'qra_changelog_unavailable': 'Unable to fetch changelog.',

        // === Nguồn/Phạm vi ===
        'qra_source_unknown': 'Unknown Source',
        'qra_source_jsr': 'Tavern Helper (JSR)',
        'qra_source_qr': 'Quick Reply (QR)',
        'qra_source_lwb': 'LittleWhiteBox (LWB)',
        'qra_source_thirdparty': 'SillyTavern extension',
        'qra_scope_global': 'Global',
        'qra_scope_character': 'Character',
        'qra_scope_preset': 'Preset',

        // Trạng thái trống
        'qra_empty_scripts': 'No available script buttons',
        'qra_empty_standard': 'No available quick replies',

        // Lỗi menu
        'qra_menu_render_error': 'Menu Render Error',
        'qra_menu_check_console': 'Press F12 to view console logs',

        // === Trợ giúp cấu hình ===
        'qra_help_tooltip': 'View details',
        'qra_setting_help_autoshrink': 'When enabled, the extension will collapse the button area above the chat input box.\n\nMoving the mouse over or clicking the input box area will automatically expand and display all buttons.\n\nThis feature works well with the whitelist, as only whitelisted buttons (or Input Helper buttons) will remain visible above the chat input. If you are not familiar with or do not use the whitelist or Input Helper, you can leave this disabled.',
        'qra_setting_help_backdrop': 'When enabled, opening the QR Assistant menu (via the button to the left of the send button) will apply a blur effect to the background.\n\nFor example, it\'s like switching apps on a smartphone, where the background becomes blurred. This feature creates a similar frosted glass effect.\n\nAs a result, it helps reduce visual fatigue (recommended).',
        'qra_setting_help_combined': 'When enabled, the buttons above the chat input box will stick together in a single row, rather than displaying on separate lines for each script/QR set.\n\nThis feature is intended to be used alongside the whitelist, as only whitelisted buttons will remain visible above the chat input area.\n\nThis setting is exactly the same as the native "Merge Quick Replies" toggle in SillyTavern. You can toggle it from either Quick Reply or QR Assistant, as they sync bidirectionally.\n\nWe duplicated this toggle in QR Assistant simply to make it more convenient to enable or disable.',

        // === Popup trợ giúp ===
        'qra_help_title': 'QR Assistant - Help',
        'qra_help_toc_video': 'Video Demo',
        'qra_help_toc_core': 'Core Features',
        'qra_help_toc_detail': 'Features',
        'qra_help_toc_whitelist': 'Whitelist',
        'qra_help_toc_icons': 'Button Icons',
        'qra_help_toc_theme': 'UI Theme',
        'qra_help_toc_sort': 'Button Sorting',
        'qra_help_toc_others': 'Other Features',
        'qra_help_toc_compat': 'extension Compatibility',
        'qra_help_toc_update': 'Update Check',

        // === Popup nhật ký ===
        'qra_log_title': 'Runtime Logs',
        'qra_btn_copy': 'Copy',
        'qra_btn_download': 'Download',
        'qra_btn_clear': 'Clear',

        // === Popup sắp xếp ===
        'qra_sort_title': 'Menu Button Sorting',
        'qra_sort_enable': 'Enable Custom Sorting',
        'qra_sort_desc': 'This mode allows you to customize the button order on the QR menu.\nWhen disabled, the buttons on the QR menu will be auto-arranged (default mode).\nWhen enabled, the buttons will be displayed on the QR menu in the order shown below, so you can drag the group buttons below to customize their arrangement.\n\nAmong them, the semi-transparent blurred buttons represent scripts/QRs that are currently disabled, while the non-transparent buttons represent those currently enabled.\n\nTheir order below is the exact order you will see when opening the QR Assistant menu panel (when custom sort is enabled).\n\nWhen a semi-transparent blurred button is enabled in the chat, it will appear in the QR Assistant menu panel according to its position in the area below.\n\nIn addition, these semi-transparent blurred buttons can be removed. Once removed, if the button is enabled later, it will be displayed at the end of the menu panel by default.\n\nIf you still do not understand the description above, you can take a screenshot and send it to an AI for explanation, or ask in the community original post.',
        'qra_sort_del_record': 'Delete Record',
        'qra_sort_inline_desc': 'This mode allows you to customize the order of the buttons on the QR menu.\nWhen closed, the buttons on the QR menu will be arranged adaptively (default mode).\nWhen opened, it will be displayed on the QR menu according to the following arrangement, so you can drag the group buttons below to customize the arrangement yourself.\nYou can click the <i class="fa-solid fa-circle-question"></i> icon above to view more detailed instructions. At the same time, when performing custom sorting, you can also preview the sorting effect in real time by clicking the <i class="fa-solid fa-eye"></i> icon in the upper right corner.',

        // === Thanh thiết lập lần đầu ===
        'qra_onboarding_theme': 'Quick Appearance',
        'qra_onboarding_icon': 'Set Icon',
        'qra_onboarding_blur': 'Background Blur',
        'qra_onboarding_done': 'Done',
        'qra_onboarding_char_card': 'Character Card',
        'qra_onboarding_builtin': 'Built-in Icons',
        'qra_onboarding_custom': 'Custom Icons',
        'qra_onboarding_custom_guide_title': 'Add Custom Icon',
        'qra_onboarding_custom_guide_text': 'Go to the Extensions menu <i class="fa-solid fa-cubes"></i> in the top bar, find <strong>QR Assistant</strong>, switch to the <strong>"Button Icon"</strong> page to add and enable custom icons.',
        'qra_onboarding_got_it': 'Got it',

        // Khác
        'qra_custom_select': '-- Select --',
        'qra_copied': 'Copied!',
        'qra_extension_name': 'QR Assistant',
        'qra_rocket_btn_title': 'Quick Reply Menu',

        // Tooltip
        'qra_tooltip_source': 'Source',
        'qra_tooltip_scope': 'Scope',
        'qra_tooltip_belong': 'Belongs to',

        // Nút bấm
        'qra_title_edit': 'Edit',
        'qra_title_delete': 'Delete',
        'qra_title_close': 'Close',
        'qra_title_toc': 'Table of Contents',
        'qra_unnamed_icon': 'Unnamed Icon',
        'qra_stack_trace': 'View Error Stack Trace',

        // Bổ sung cho popup sắp xếp
        'qra_sort_group_empty': 'No valid buttons found in memory for this group',
        'qra_sort_expand_collapse': 'Expand/Collapse',
        'qra_btn_read': 'Read',
        'qra_sort_btn_enabled': 'Custom Sort Enabled',
        'qra_setting_help_sort': 'When this feature is enabled, the buttons in the QR Assistant menu will be sorted according to the order you set.\n\nThis feature is disabled by default. When disabled, the plugin uses its own logic to auto-arrange the menu buttons.\n\nThe plugin\'s default sorting logic fits most people\'s habits and is generally sufficient, but you are also welcome to customize the sorting according to your own preferences.\n\nWhen enabled, the "Settings" button on the right side of the option will change to "Custom Sort Enabled".',
    },

    'zh-tw': {
        // === Thẻ Tab ===
        'qra_tab_main': 'Cài đặt chính',
        'qra_tab_whitelist': 'Danh sách trắng',
        'qra_tab_icon': 'Biểu tượng nút',

        // === Trang cài đặt chính ===
        'qra_label_version': 'Phiên bản',
        'qra_btn_check_update': 'Kiểm tra cập nhật',
        'qra_opt_enable': 'Bật tiện ích',
        'qra_opt_disable': 'Tắt tiện ích',
        'qra_label_ui_theme': 'Giao diện (UI Theme)',
        'qra_theme_default': 'Mặc định',
        'qra_theme_system': 'Theo hệ thống',
        'qra_theme_sakura': 'Hoa anh đào',
        'qra_theme_classical': 'Cổ điển',
        'qra_theme_dark': 'Tối',
        'qra_theme_paper': 'Giấy Washi',
        'qra_theme_ceramic': 'Gốm trắng',
        'qra_theme_lavender': 'Oải hương',
        'qra_theme_smoked': 'Khói',
        'qra_theme_aurora': 'Cực quang',
        'qra_theme_forest': 'Rừng sương mù',

        // Thẻ (Card)
        'qra_card_autoshrink_title': 'Tự động thu gọn nút',
        'qra_card_autoshrink_desc': 'Tự động thu gọn khu vực nút phía trên hộp nhập liệu chat',
        'qra_card_backdrop_title': 'Hiệu ứng làm mờ nền',
        'qra_card_backdrop_desc': 'Áp dụng hiệu ứng kính mờ cho nền khi mở menu',
        'qra_card_combined_title': 'Gộp phản hồi nhanh (QR v2)',
        'qra_card_combined_desc': 'Gộp tất cả các bảng phản hồi nhanh độc lập thành một',
        'qra_card_sort_title': 'Sắp xếp nút menu',
        'qra_card_sort_desc': 'Cho phép tùy chỉnh thứ tự các nút trên menu',
        'qra_card_help_title': 'Hướng dẫn sử dụng tiện ích',
        'qra_card_help_desc': 'Xem giới thiệu chi tiết và trợ giúp về tiện ích này',
        'qra_card_log_title': 'Nhật ký hệ thống',
        'qra_card_log_desc': 'Xem trạng thái hoạt động, khắc phục sự cố hoặc xuất nhật ký',

        'qra_btn_settings': 'Cài đặt',
        'qra_btn_open': 'Mở',

        // Nhật ký
        'qra_log_level_debug': 'DEBUG (Tất cả)',
        'qra_log_level_info': 'INFO (Thông thường)',
        'qra_log_level_warn': 'WARN (Chỉ cảnh báo)',
        'qra_log_level_error': 'ERROR (Chỉ lỗi)',
        'qra_btn_view_logs': 'Xem nhật ký',
        'qra_btn_download_logs': 'Tải nhật ký',

        // === Trang Danh sách trắng ===
        'qra_whitelist_hidden': 'Danh sách thu gọn (Ẩn)',
        'qra_whitelist_visible': 'Danh sách trắng (Hiển thị)',
        'qra_whitelist_help_p1': 'Nhấp trực tiếp vào một tùy chọn trong danh sách trên để di chuyển nút tương ứng sang danh sách bên kia.',
        'qra_whitelist_help_p2': 'Các nút trong Danh sách trắng sẽ được giữ lại phía trên hộp nhập liệu chat và không hiển thị trong menu của QR Assistant; ngược lại, các nút trong Danh sách thu gọn sẽ xuất hiện trong menu và không hiển thị phía trên hộp nhập liệu.',
        'qra_whitelist_help_p3': 'Người dùng điện thoại có thể nhấn giữ vào tùy chọn QR hoặc script tương ứng trong danh sách để xem nguồn và phạm vi cụ thể của tùy chọn đó.',
        'qra_whitelist_help_p4': 'Ngoài ra, <i class="fa-solid fa-sun"></i> biểu thị script LittleWhiteBox, <i class="fa-solid fa-star"></i> biểu thị QR, <i class="fa-solid fa-moon"></i> biểu thị script Tavern Helper, và <i class="fa-solid fa-puzzle-piece"></i> biểu thị tiện ích mở rộng của SillyTavern.',

        // === Trang Cài đặt biểu tượng ===
        'qra_icon_source_builtin': 'Biểu tượng tích hợp',
        'qra_icon_source_character': 'Thẻ nhân vật hiện tại',
        'qra_icon_source_custom': 'Biểu tượng tùy chỉnh',

        'qra_icon_rocket': 'Tên lửa',
        'qra_icon_bolt': 'Ngôi sao 6 cánh',
        'qra_icon_comment': 'Bảng màu',
        'qra_icon_star': 'Sao & Trăng khuyết',
        'qra_icon_fan': 'Chong chóng',
        'qra_icon_pencil': 'Bút chì',
        'qra_icon_book': 'Sách',
        'qra_icon_mug': 'Cà phê nóng',
        'qra_icon_crown': 'Vương miện',
        'qra_icon_gem': 'Kim cương',
        'qra_icon_headphones': 'Tai nghe',

        'qra_label_btn_icon': 'Biểu tượng nút',
        'qra_label_preview': 'Xem trước',
        'qra_label_icon_size': 'Kích thước biểu tượng',
        'qra_opt_size_match': 'Khớp với kích thước nút Gửi',
        'qra_opt_size_custom': 'Kích thước tùy chỉnh',
        'qra_label_size_em': 'Kích thước (em)',

        'qra_char_desc': 'Hiển thị ảnh đại diện của nhân vật hiện tại làm biểu tượng nút, tự động cập nhật khi chuyển đổi chat.',
        'qra_char_no_avatar': 'Không có ảnh đại diện',
        'qra_char_avatar_rotation': 'Bật hiệu ứng xoay ảnh đại diện',

        'qra_custom_placeholder': '-- Vui lòng chọn hoặc thêm --',
        'qra_custom_no_icon': 'Không có biểu tượng',
        'qra_btn_manage_icons': 'Quản lý biểu tượng',
        'qra_btn_add_icon': 'Thêm biểu tượng',

        // === Popup (Modal) ===
        'qra_modal_manage_title': 'Quản lý biểu tượng tùy chỉnh',
        'qra_modal_add_title': 'Thêm biểu tượng tùy chỉnh',
        'qra_modal_edit_title': 'Sửa biểu tượng',
        'qra_label_name': 'Tên',
        'qra_label_icon_url': 'URL biểu tượng',
        'qra_link_image_host': 'Host ảnh miễn phí',
        'qra_label_icon_size_hint': 'Kích thước biểu tượng (Mặc định 1.2 là khớp với kích thước nút Gửi. Không nên thay đổi trừ khi bạn muốn ép buộc làm biểu tượng lớn hoặc nhỏ hơn):',
        'qra_placeholder_name': 'Ví dụ: Paimon',
        'qra_placeholder_url': 'Nhập liên kết host ảnh',
        'qra_btn_save': 'Lưu',
        'qra_btn_cancel': 'Hủy',
        'qra_btn_save_changes': 'Lưu thay đổi',
        'qra_btn_back': 'Quay lại',
        'qra_btn_close': 'Đóng',
        'qra_no_saved_icons': 'Chưa có biểu tượng nào được lưu',

        // Xác nhận/Thông báo
        'qra_confirm_delete_icon': 'Bạn có chắc chắn muốn xóa biểu tượng này không?',
        'qra_alert_name_url_required': 'Tên và liên kết không được để trống',
        'qra_alert_url_required': 'Vui lòng nhập liên kết biểu tượng',
        'qra_confirm_update': 'Thao tác cập nhật sẽ tải lại trang, hãy đảm bảo bạn đã lưu cuộc trò chuyện.\nBạn có chắc chắn muốn cập nhật không?',
        'qra_alert_update_sent': 'Lệnh cập nhật đã được gửi, trang sẽ tải lại ngay.',
        'qra_alert_update_failed': 'Cập nhật thất bại, vui lòng kiểm tra nhật ký console.',
        'qra_alert_update_error': 'Lỗi yêu cầu cập nhật: ',
        'qra_confirm_clear_logs': 'Bạn có chắc chắn muốn xóa toàn bộ nhật ký không?',
        'qra_toastr_export_failed': 'Xuất nhật ký thất bại, vui lòng kiểm tra console',

        // Liên quan đến cập nhật
        'qra_checking': 'Đang kiểm tra...',
        'qra_up_to_date': 'Đã là bản mới nhất',
        'qra_new_version_found': 'Đã tìm thấy phiên bản mới',
        'qra_check_failed': 'Kiểm tra thất bại',
        'qra_btn_check_update': 'Kiểm tra cập nhật',
        'qra_label_current_version': 'Phiên bản',

        // Popup cập nhật
        'qra_modal_update_title': 'Nhật ký cập nhật tiện ích',
        'qra_update_tip': 'Nếu cập nhật thất bại, bạn có thể cập nhật QR Assistant thủ công trong danh sách Quản lý tiện ích mở rộng. Nếu vẫn thất bại, hãy thử xóa và cài đặt lại để sử dụng phiên bản mới nhất.',
        'qra_btn_update_now': 'Cập nhật ngay',
        'qra_loading_changelog': 'Đang tải nhật ký cập nhật...',
        'qra_changelog_unavailable': 'Không thể lấy nhật ký cập nhật.',

        // === Nguồn/Phạm vi ===
        'qra_source_unknown': 'Nguồn không xác định',
        'qra_source_jsr': 'Tavern Helper (JSR)',
        'qra_source_qr': 'Phản hồi nhanh (QR)',
        'qra_source_lwb': 'LittleWhiteBox (LWB)',
        'qra_source_thirdparty': 'Tiện ích SillyTavern',
        'qra_scope_global': 'Toàn cục',
        'qra_scope_character': 'Nhân vật',
        'qra_scope_preset': 'Preset',

        // Trạng thái trống
        'qra_empty_scripts': 'Không có nút script nào khả dụng',
        'qra_empty_standard': 'Không có phản hồi nhanh nào khả dụng',

        // Lỗi menu
        'qra_menu_render_error': 'Lỗi render menu',
        'qra_menu_check_console': 'Vui lòng nhấn F12 để xem chi tiết nhật ký trong console',

        // === Trợ giúp cấu hình ===
        'qra_help_tooltip': 'Xem chi tiết',
        'qra_setting_help_autoshrink': 'Khi bật tính năng này, tiện ích sẽ tự động thu gọn khu vực các nút phía trên hộp nhập liệu chat.\n\nKhi di chuột qua hoặc nhấp vào khu vực hộp nhập liệu, nó sẽ tự động mở rộng và hiển thị lại tất cả các nút.\n\nTính năng này kết hợp tốt với danh sách trắng, vì chỉ những nút trong danh sách trắng (hoặc nút của Input Helper) mới được giữ lại phía trên hộp nhập liệu. Nếu bạn không quen hoặc không sử dụng tính năng danh sách trắng và Input Helper, bạn có thể tắt tính năng này.',
        'qra_setting_help_backdrop': 'Khi bật tính năng này, mỗi lần bạn mở menu của QR Assistant (bằng nút bên trái nút gửi), nền sẽ được làm mờ.\n\nGiống như khi bạn chuyển đổi ứng dụng trên điện thoại và nền màn hình chính bị mờ đi. Tính năng này tạo ra hiệu ứng kính mờ tương tự.\n\nNhờ vậy, nó giúp giảm mỏi mắt (khuyên dùng).',
        'qra_setting_help_combined': 'Khi bật tính năng này, các nút phía trên hộp nhập liệu chat sẽ xếp sát vào nhau trên một hàng, thay vì mỗi script/QR hiển thị trên một dòng riêng biệt.\n\nTính năng này cũng được dùng kết hợp với danh sách trắng, vì chỉ những nút được đưa vào danh sách trắng mới hiển thị phía trên hộp nhập liệu.\n\nTính năng này thực chất chính là "Gộp phản hồi nhanh" có sẵn trong SillyTavern, hoạt động hoàn toàn giống nhau (bạn có thể bật/tắt nó trong QR Assistant hoặc phần Quick Reply, cả hai đều đồng bộ hai chiều).\n\nViệc tích hợp công tắc này trong QR Assistant chủ yếu để giúp bạn bật/tắt thuận tiện hơn.',

        // === Popup trợ giúp ===
        'qra_help_title': 'QR Assistant - Hướng dẫn sử dụng',
        'qra_help_toc_video': 'Video minh họa',
        'qra_help_toc_core': 'Tính năng cốt lõi',
        'qra_help_toc_detail': 'Tính năng cụ thể',
        'qra_help_toc_whitelist': 'Danh sách trắng',
        'qra_help_toc_icons': 'Biểu tượng nút',
        'qra_help_toc_theme': 'Giao diện (UI Theme)',
        'qra_help_toc_sort': 'Sắp xếp nút menu',
        'qra_help_toc_others': 'Tính năng khác',
        'qra_help_toc_compat': 'Tương thích tiện ích khác',
        'qra_help_toc_update': 'Kiểm tra cập nhật',

        // === Popup nhật ký ===
        'qra_log_title': 'Nhật ký hệ thống',
        'qra_btn_copy': 'Sao chép',
        'qra_btn_download': 'Tải xuống',
        'qra_btn_clear': 'Xóa sạch',

        // === Popup sắp xếp ===
        'qra_sort_title': 'Quản lý sắp xếp nhóm menu',
        'qra_sort_enable': 'Bật chế độ sắp xếp tùy chỉnh',
        'qra_sort_desc': 'Chế độ này cho phép bạn tùy chỉnh thứ tự các nút trên menu QR.\nKhi tắt, các nút trên menu QR sẽ tự động sắp xếp (chế độ mặc định).\nKhi bật, chúng sẽ hiển thị trên menu QR theo thứ tự dưới đây, vì vậy bạn có thể kéo thả các nhóm nút bên dưới để tự do sắp xếp.\n\nTrong đó, các nút làm mờ bán trong suốt là các script/QR hiện đang bị tắt, còn các nút không mờ là những nút đang được bật.\n\nVị trí của chúng ở khu vực bên dưới chính là thứ tự bạn sẽ thấy khi mở menu của QR Assistant (khi chế độ sắp xếp tùy chỉnh được bật).\n\nKhi một nút mờ được bật trong chat, nó sẽ xuất hiện trong menu của QR Assistant theo đúng vị trí của nó ở khu vực bên dưới.\n\nNgoài ra, các nút làm mờ này có thể bị xóa đi. Sau khi xóa, nếu nút đó được bật lại, nó sẽ mặc định xuất hiện ở cuối menu.\n\nNếu bạn vẫn không hiểu mô tả trên, bạn có thể chụp ảnh màn hình và gửi cho AI để giải thích, hoặc hỏi trong bài viết cộng đồng.',
        'qra_sort_del_record': 'Xóa bản ghi',
        'qra_sort_inline_desc': 'Chế độ này cho phép bạn tùy chỉnh thứ tự các nút trên menu QR.\nKhi tắt, các nút trên menu QR sẽ tự động sắp xếp (chế độ mặc định).\nKhi bật, chúng sẽ hiển thị theo thứ tự dưới đây, do đó bạn có thể kéo thả để tùy chỉnh thứ tự.\nBạn có thể nhấp vào biểu tượng <i class="fa-solid fa-circle-question"></i> phía trên để xem hướng dẫn chi tiết. Đồng thời, khi thực hiện sắp xếp, bạn có thể xem trước kết quả bằng cách nhấp vào biểu tượng <i class="fa-solid fa-eye"></i> ở góc trên bên phải.',

        // === Thanh thiết lập lần đầu ===
        'qra_onboarding_theme': 'Giao diện nhanh',
        'qra_onboarding_icon': 'Cài đặt biểu tượng',
        'qra_onboarding_blur': 'Làm mờ nền',
        'qra_onboarding_done': 'Hoàn tất',
        'qra_onboarding_char_card': 'Thẻ nhân vật hiện tại',
        'qra_onboarding_builtin': 'Biểu tượng tích hợp',
        'qra_onboarding_custom': 'Biểu tượng tùy chỉnh',
        'qra_onboarding_custom_guide_title': 'Thêm biểu tượng tùy chỉnh',
        'qra_onboarding_custom_guide_text': 'Vui lòng nhấp vào biểu tượng <i class="fa-solid fa-cubes"></i> quản lý tiện ích trên thanh menu, tìm <strong>QR Assistant</strong>, chuyển sang tab <strong>"Biểu tượng nút"</strong> để thêm và kích hoạt biểu tượng tùy chỉnh.',
        'qra_onboarding_got_it': 'Đã hiểu',

        // Khác
        'qra_custom_select': '-- Vui lòng chọn --',
        'qra_copied': 'Đã sao chép!',
        'qra_extension_name': 'QR Assistant',
        'qra_rocket_btn_title': 'Menu Phản hồi nhanh',

        // Tooltip
        'qra_tooltip_source': 'Nguồn',
        'qra_tooltip_scope': 'Phạm vi',
        'qra_tooltip_belong': 'Thuộc về',

        // Nút bấm
        'qra_title_edit': 'Chỉnh sửa',
        'qra_title_delete': 'Xóa',
        'qra_title_close': 'Đóng',
        'qra_title_toc': 'Mục lục',
        'qra_unnamed_icon': 'Biểu tượng chưa đặt tên',
        'qra_stack_trace': 'Xem Stack Trace của lỗi',

        // Bổ sung cho popup sắp xếp
        'qra_sort_group_empty': 'Không tìm thấy nút hợp lệ nào cho nhóm này trong bộ nhớ',
        'qra_sort_expand_collapse': 'Mở rộng/Thu gọn',
        'qra_btn_read': 'Đã đọc',
        'qra_sort_btn_enabled': 'Đã bật sắp xếp tùy chỉnh',
        'qra_setting_help_sort': 'Khi tính năng này được bật, các nút trong menu của QR Assistant sẽ được sắp xếp theo thứ tự bạn đã thiết lập.\n\nTính năng này bị tắt theo mặc định. Khi tắt, tiện ích sẽ tự động sắp xếp các nút trong menu theo logic có sẵn.\n\nLogic sắp xếp mặc định khá phù hợp với thói quen của hầu hết mọi người và thường là đủ dùng. Đương nhiên, bạn luôn được chào đón để tùy chỉnh thứ tự theo sở thích của mình.\n\nKhi bật, nút "Cài đặt" bên phải tùy chọn sẽ đổi thành "Đã bật sắp xếp tùy chỉnh".',
    }
};

// === Khối đa ngôn ngữ Hướng dẫn sử dụng ===
export const helpDocs = {
    'en': `
    <h2 id="help-video">Video Demo</h2>
    <div class="qr-help-video-container">
        <video controls controlsList="nodownload" preload="metadata">
            <source src="https://files.catbox.moe/mu8kg5.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </div>

    <h2 id="help-core">Core Features</h2>
    <ul>
        <li>Collects all buttons from above the chat input bar into a single menu, accessible via the icon to the left of the send button.</li>
    </ul>
    <blockquote>
        The extension provides a <code>Whitelist</code> feature. Buttons in the whitelist will remain above the input bar instead of being moved to the menu, so you can selectively keep some buttons visible (e.g., Input Helper).
    </blockquote>

    <h2 id="help-detail">Feature Details</h2>

    <h3 id="help-whitelist">Whitelist</h3>
    <ul>
        <li>Click any QR, JSR script, or LittleWhiteBox button entry to move it to the whitelist. Whitelisted buttons will remain above the chat input bar.</li>
    </ul>

    <h3 id="help-icons">Button Icon</h3>
    <h4>Built-in Icons</h4>
    <ul>
        <li>The default button icon is Star & Crescent. The extension also offers Rocket, Hexagram, Palette, and many other built-in icons.</li>
    </ul>
    <h4>Custom Icons</h4>
    <ul>
        <li>In addition to built-in icons, the extension supports <code>Custom Icons</code>.</li>
        <li>Click <code>Add Icon</code>, then enter a name and image hosting URL to add a custom icon. A free image host link (Catbox) is provided inside the dialog.</li>
        <li>Click <code>Manage Icons</code> to rename or delete your custom icons.</li>
    </ul>
    <h4>Current Character Card</h4>
    <ul>
        <li>The extension also supports using the <code>Current Character Card</code> avatar as the button icon. It updates automatically when switching chats.</li>
    </ul>
    <h4>Other Notes</h4>
    <p>If the SillyTavern theme you are using comes with its own QR Assistant icon, that theme icon will override your current selection. This is expected behavior.</p>
    <p>The QR Assistant icon has the ID <code>quick-reply-rocket-button</code>. Theme designers are more than welcome to replace the QR Assistant icon using this ID!</p>

    <h3 id="help-theme">Menu UI Themes</h3>
    <ul>
        <li>The extension includes multiple built-in UI themes for you to choose from.</li>
    </ul>

    <h3 id="help-sort">Menu Button Custom Sorting</h3>
    <ul>
        <li>The extension supports custom sorting of menu buttons. Click the <code>Settings</code> button in the <code>Button Sorting</code> card on the main settings page to open the sort management dialog.</li>
        <li>When custom sorting is disabled, menu buttons are auto-arranged (default mode).</li>
        <li>When custom sorting is enabled, you can drag buttons to customize their order in the menu.</li>
    </ul>

    <h3 id="help-others">Other Features</h3>
    <h4>Enable/Disable QR Assistant</h4>
    <ul><li>Use the <code>Enable/Disable extension</code> dropdown.</li></ul>
    <h4>Auto-Hide Input Bar Buttons</h4>
    <ul><li>Enable the <code>Auto-Collapse Buttons</code> feature.</li></ul>
    <h4>Background Blur Effect</h4>
    <ul><li>Enable the <code>Background Blur</code> feature.</li></ul>
    <h4>Merge Quick Replies</h4>
    <ul><li>Enabling the Merge Quick Replies feature makes all buttons kept above the input bar stick together in a single row, rather than each script/QR button displaying on its own separate line. This is the same feature as the "Merge Quick Replies" setting in Quick Reply v2, and the two stay in sync.</li></ul>

    <h3 id="help-thirdparty-api">Third-Party Plugin Button Registration API</h3>
    <p>QR Assistant allows third-party SillyTavern extensions to register custom buttons into the QR Assistant system via <code>window.qrAssistantExtensionApi</code> (so QR Assistant can directly capture and manage extension buttons).</p>
    <p>Example — register a custom button from your extension:</p>
    <pre><code>// Ensure the array exists before pushing
if (!window.qrAssistantExtensionApi) {
    window.qrAssistantExtensionApi = [];
}

// Register your custom button
window.qrAssistantExtensionApi.push({
    dom_id: 'my-extension-custom-btn',       // (Required) The id of the DOM element to capture
    group_name: 'My Extension Name',          // (Optional) Display name shown in the menu header
    button_name: 'My Button Label'            // (Optional) Button label text; if omitted, falls back to
                                              //            the element's title or textContent
});</code></pre>
    <p><code>dom_id</code> — the <code>id</code> attribute of the DOM element you want QR Assistant to capture and move into its menu.</p>
    <p><code>group_name</code> — the group header displayed above the button in the menu. If omitted, defaults to a generic label.</p>
    <p><code>button_name</code> — the text or FontAwesome icon class displayed on the button. Supports plain text labels or FontAwesome classes like <code>fa-solid fa-star</code>.</p>
    <p>QR Assistant reads this registry every time it rebuilds the menu.</p>
    <p>If you still don't understand, you can send this section directly to an AI for help!</p>

    <h3 id="help-compat">Input Helper & Preset Transfer extension</h3>
    <ul>
        <li>Add Input Helper (Script Version) to the whitelist to keep its symbol buttons visible.</li>
        <li>Compatible with the <code>Preset Transfer Tool</code> extension — its "World Book Common" button will appear on the left side of the list.</li>
    </ul>

    <h3 id="help-update">Update Check</h3>
    <ul>
        <li>In addition to SillyTavern's built-in update check on the Extensions management page, the extension also checks for new versions automatically every 24 hours. When a new version is available, a <code>NEW</code> badge will appear, and the <code>Check for Updates</code> button will turn red with the text <code>New Version Found</code>. Click it to view the changelog and quickly update the extension.</li>
        <li>If the update fails, you can manually update QR Assistant from the Extensions management page. If it still fails, try deleting and reinstalling the extension to use the latest version.</li>
    </ul>
    <div style="height: 100px;"></div>
`,

    'zh-tw': `
    <h2 id="help-video">Video minh họa</h2>
    <div class="qr-help-video-container">
        <video controls controlsList="nodownload" preload="metadata">
            <source src="https://files.catbox.moe/mu8kg5.mp4" type="video/mp4">
            Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
    </div>

    <h2 id="help-core">Tính năng cốt lõi</h2>
    <ul>
        <li>Có khả năng di chuyển tất cả các nút phía trên hộp nhập liệu chat vào một menu độc lập, và bạn có thể mở menu này thông qua biểu tượng ở bên trái nút Gửi.</li>
    </ul>
    <blockquote>
        Tiện ích cung cấp tính năng <code>Danh sách trắng</code>. Các nút nằm trong <code>Danh sách trắng</code> sẽ không bị chuyển vào menu. Do đó, bạn có thể chọn giữ lại một số nút phía trên hộp nhập liệu (ví dụ: Input Helper).
    </blockquote>

    <h2 id="help-detail">Giới thiệu chi tiết tính năng</h2>

    <h3 id="help-whitelist">Tính năng Danh sách trắng</h3>
    <ul>
        <li>Nhấp vào nút QR, script Tavern hoặc LittleWhiteBox tương ứng để chuyển nó sang danh sách trắng. Các nút trong danh sách trắng sẽ được giữ lại phía trên hộp nhập liệu.</li>
    </ul>

    <h3 id="help-icons">Biểu tượng nút</h3>
    <h4>Biểu tượng tích hợp</h4>
    <ul>
        <li>Biểu tượng mặc định là Sao & Trăng khuyết, ngoài ra tiện ích còn tích hợp sẵn Tên lửa, Ngôi sao 6 cánh, Bảng màu và nhiều biểu tượng khác để bạn lựa chọn.</li>
    </ul>
    <h4>Biểu tượng tùy chỉnh</h4>
    <ul>
        <li>Ngoài các biểu tượng tích hợp sẵn, tiện ích còn hỗ trợ <code>Biểu tượng tùy chỉnh</code>.</li>
        <li>Nhấp vào nút <code>Thêm biểu tượng</code>, sau đó nhập tên biểu tượng tùy chỉnh và liên kết host ảnh để thêm. Ngoài ra, bên trong popup có cung cấp sẵn liên kết host ảnh miễn phí (catbox).</li>
        <li>Nhấp vào nút <code>Quản lý biểu tượng</code> để thay đổi tên hoặc xóa các biểu tượng tùy chỉnh tương ứng.</li>
    </ul>
    <h4>Thẻ nhân vật hiện tại</h4>
    <ul>
        <li>Tiện ích cũng hỗ trợ sử dụng ảnh đại diện của <code>Thẻ nhân vật hiện tại</code> làm biểu tượng nút, tự động cập nhật thành ảnh đại diện của nhân vật tương ứng khi chuyển đổi chat.</li>
    </ul>
    <h4>Lưu ý khác</h4>
    <p>Nếu giao diện (theme) của SillyTavern đã có sẵn biểu tượng cho QR Assistant, biểu tượng của theme đó sẽ ghi đè lên biểu tượng QR Assistant bạn đang chọn. Đây là hiện tượng bình thường.</p>
    <p>ID của biểu tượng QR Assistant là <code>quick-reply-rocket-button</code>, rất hoan nghênh các tác giả làm theme thay thế biểu tượng QR Assistant!</p>

    <h3 id="help-theme">Giao diện (UI Theme) của menu</h3>
    <ul>
        <li>Tiện ích tích hợp sẵn nhiều chủ đề UI để bạn lựa chọn.</li>
    </ul>

    <h3 id="help-sort">Sắp xếp tùy chỉnh nút menu</h3>
    <ul>
        <li>Tiện ích hỗ trợ tự do sắp xếp các nút trên menu. Tại trang cài đặt chính, nhấp vào nút <code>Cài đặt</code> trong thẻ <code>Sắp xếp nút menu</code> để mở popup quản lý sắp xếp.</li>
        <li>Khi tắt sắp xếp tùy chỉnh, các nút menu sẽ được sắp xếp tự động (chế độ mặc định).</li>
        <li>Khi bật sắp xếp tùy chỉnh, bạn có thể kéo thả các nút để thay đổi thứ tự trong menu.</li>
    </ul>

    <h3 id="help-others">Tính năng khác</h3>
    <h4>Bật/tắt QR Assistant bằng một cú nhấp</h4>
    <ul><li>Chỉ cần chọn <code>Bật/Tắt tiện ích</code>.</li></ul>
    <h4>Tự động thu gọn khu vực hộp nhập liệu</h4>
    <ul><li>Chỉ cần bật tính năng <code>Tự động thu gọn nút</code>.</li></ul>
    <h4>Hiệu ứng làm mờ nền cho menu nút</h4>
    <ul><li>Chỉ cần bật tính năng <code>Hiệu ứng làm mờ nền</code>.</li></ul>
    <h4>Gộp phản hồi nhanh</h4>
    <ul><li>Khi bật tính năng này, tất cả các nút được giữ lại phía trên hộp nhập liệu sẽ xếp sát vào nhau, thay vì mỗi nút script/QR hiển thị trên một dòng riêng biệt. Tính năng này giống hệt tính năng "Gộp phản hồi nhanh" có sẵn trong SillyTavern và cả hai sẽ được đồng bộ với nhau.</li></ul>

    <h3 id="help-thirdparty-api">API đăng ký nút cho tiện ích bên thứ ba</h3>
    <p>QR Assistant cho phép các tiện ích SillyTavern bên thứ ba đăng ký các nút tùy chỉnh vào hệ thống của QR Assistant thông qua <code>window.qrAssistantExtensionApi</code> (giúp QR Assistant có thể trực tiếp lấy và quản lý nút của tiện ích đó).</p>
    <p>Ví dụ — đăng ký một nút tùy chỉnh từ tiện ích của bạn:</p>
    <pre><code>// Đảm bảo mảng tồn tại trước khi push
if (!window.qrAssistantExtensionApi) {
    window.qrAssistantExtensionApi = [];
}

// Đăng ký nút tùy chỉnh của bạn
window.qrAssistantExtensionApi.push({
    dom_id: 'my-extension-custom-btn',       // (Bắt buộc) ID của phần tử DOM muốn lấy
    group_name: 'Tên tiện ích của tôi',       // (Tùy chọn) Tên nhóm hiển thị trong menu
    button_name: 'Chữ trên nút của tôi'       // (Tùy chọn) Chữ hiển thị trên nút; nếu bỏ qua,
                                              //         sẽ tự động dùng title hoặc textContent của phần tử
});</code></pre>
    <p><code>dom_id</code> — thuộc tính <code>id</code> của phần tử DOM mà bạn muốn QR Assistant lấy và chuyển vào menu.</p>
    <p><code>group_name</code> — Tiêu đề nhóm hiển thị phía trên nút trong menu. Nếu bỏ qua, sẽ dùng nhãn mặc định.</p>
    <p><code>button_name</code> — Văn bản hoặc class icon FontAwesome hiển thị trên nút. Hỗ trợ chữ thuần hoặc class FontAwesome, ví dụ như <code>fa-solid fa-star</code>.</p>
    <p>QR Assistant sẽ đọc danh sách đăng ký này mỗi khi nó xây dựng lại menu.</p>
    <p>Nếu bạn vẫn không hiểu, bạn có thể gửi trực tiếp đoạn hướng dẫn này cho AI!</p>

    <h3 id="help-compat">Tương thích với Input Helper và Tiện ích chuyển Preset</h3>
    <ul>
        <li>Chuyển Input Helper (bản script) vào Danh sách trắng để hiển thị bình thường các nút ký hiệu tương ứng.</li>
        <li>Đã tương thích với nút "Sách thế giới thường dùng" của tiện ích <code>Công cụ chuyển đổi Preset</code>, nút này sẽ hiển thị ở bên trái danh sách.</li>
    </ul>

    <h3 id="help-update">Kiểm tra cập nhật</h3>
    <ul>
        <li>Bên cạnh tính năng kiểm tra cập nhật có sẵn của SillyTavern trong trang <code>Quản lý tiện ích mở rộng</code>, tiện ích này cũng có khả năng tự động kiểm tra phiên bản mới. Mỗi 24 giờ sẽ tự động kiểm tra một lần. Nếu có phiên bản mới, biểu tượng <code>NEW</code> sẽ xuất hiện và nút <code>Kiểm tra phiên bản</code> sẽ chuyển thành tiêu đề <code>Đã tìm thấy phiên bản mới</code> màu đỏ. Nhấp vào <code>Đã tìm thấy phiên bản mới</code> để xem nhật ký cập nhật và nhanh chóng tiến hành cập nhật.</li>
        <li>Nếu cập nhật thất bại, bạn có thể cập nhật QR Assistant thủ công trong danh sách <code>Quản lý tiện ích mở rộng</code>. Nếu vẫn không thành công, bạn có thể thử xóa và cài đặt lại để sử dụng phiên bản mới nhất.</li>
    </ul>
    <div style="height: 100px;"></div>
`,

    'zh-cn': `
    <h2 id="help-video">Video minh họa</h2>
    <div class="qr-help-video-container">
        <video controls controlsList="nodownload" preload="metadata">
            <source src="https://files.catbox.moe/mu8kg5.mp4" type="video/mp4">
            Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
    </div>

    <h2 id="help-core">Tính năng cốt lõi</h2>
    <ul>
        <li>Có khả năng di chuyển tất cả các nút phía trên hộp nhập liệu chat vào một menu độc lập, và bạn có thể mở menu này thông qua biểu tượng ở bên trái nút Gửi.</li>
    </ul>
    <blockquote>
        Tiện ích cung cấp tính năng <code>Danh sách trắng</code>. Các nút nằm trong <code>Danh sách trắng</code> sẽ không bị chuyển vào menu. Do đó, bạn có thể chọn giữ lại một số nút phía trên hộp nhập liệu (ví dụ: Input Helper).
    </blockquote>

    <h2 id="help-detail">Giới thiệu chi tiết tính năng</h2>

    <h3 id="help-whitelist">Tính năng Danh sách trắng</h3>
    <ul>
        <li>Nhấp vào nút QR, script Tavern hoặc LittleWhiteBox tương ứng để chuyển nó sang danh sách trắng. Các nút trong danh sách trắng sẽ được giữ lại phía trên hộp nhập liệu.</li>
    </ul>

    <h3 id="help-icons">Biểu tượng nút</h3>
    <h4>Biểu tượng tích hợp</h4>
    <ul>
        <li>Biểu tượng mặc định là Sao & Trăng khuyết, ngoài ra tiện ích còn tích hợp sẵn Tên lửa, Ngôi sao 6 cánh, Bảng màu và nhiều biểu tượng khác để bạn lựa chọn.</li>
    </ul>
    <h4>Biểu tượng tùy chỉnh</h4>
    <ul>
        <li>Ngoài các biểu tượng tích hợp sẵn, tiện ích còn hỗ trợ <code>Biểu tượng tùy chỉnh</code>.</li>
        <li>Nhấp vào nút <code>Thêm biểu tượng</code>, sau đó nhập tên biểu tượng tùy chỉnh và liên kết host ảnh để thêm. Ngoài ra, bên trong popup có cung cấp sẵn liên kết host ảnh miễn phí (catbox).</li>
        <li>Nhấp vào nút <code>Quản lý biểu tượng</code> để thay đổi tên hoặc xóa các biểu tượng tùy chỉnh tương ứng.</li>
    </ul>
    <h4>Thẻ nhân vật hiện tại</h4>
    <ul>
        <li>Tiện ích cũng hỗ trợ sử dụng ảnh đại diện của <code>Thẻ nhân vật hiện tại</code> làm biểu tượng nút, tự động cập nhật thành ảnh đại diện của nhân vật tương ứng khi chuyển đổi chat.</li>
    </ul>
    <h4>Lưu ý khác</h4>
    <p>Nếu giao diện (theme) của SillyTavern đã có sẵn biểu tượng cho QR Assistant, biểu tượng của theme đó sẽ ghi đè lên biểu tượng QR Assistant bạn đang chọn. Đây là hiện tượng bình thường.</p>
    <p>ID của biểu tượng QR Assistant là <code>quick-reply-rocket-button</code>, rất hoan nghênh các tác giả làm theme thay thế biểu tượng QR Assistant!</p>

    <h3 id="help-theme">Giao diện (UI Theme) của menu</h3>
    <ul>
        <li>Tiện ích tích hợp sẵn nhiều chủ đề UI để bạn lựa chọn.</li>
    </ul>

    <h3 id="help-sort">Sắp xếp tùy chỉnh nút menu</h3>
    <ul>
        <li>Tiện ích hỗ trợ tự do sắp xếp các nút trên menu. Tại trang cài đặt chính, nhấp vào nút <code>Cài đặt</code> trong thẻ <code>Sắp xếp nút menu</code> để mở popup quản lý sắp xếp.</li>
        <li>Khi tắt sắp xếp tùy chỉnh, các nút menu sẽ được sắp xếp tự động (chế độ mặc định).</li>
        <li>Khi bật sắp xếp tùy chỉnh, bạn có thể kéo thả các nút để thay đổi thứ tự trong menu.</li>
    </ul>

    <h3 id="help-others">Tính năng khác</h3>
    <h4>Bật/tắt QR Assistant bằng một cú nhấp</h4>
    <ul><li>Chỉ cần chọn <code>Bật/Tắt tiện ích</code>.</li></ul>
    <h4>Tự động thu gọn khu vực hộp nhập liệu</h4>
    <ul><li>Chỉ cần bật tính năng <code>Tự động thu gọn nút</code>.</li></ul>
    <h4>Hiệu ứng làm mờ nền cho menu nút</h4>
    <ul><li>Chỉ cần bật tính năng <code>Hiệu ứng làm mờ nền</code>.</li></ul>
    <h4>Gộp phản hồi nhanh</h4>
    <ul><li>Khi bật tính năng này, tất cả các nút được giữ lại phía trên hộp nhập liệu sẽ xếp sát vào nhau, thay vì mỗi nút script/QR hiển thị trên một dòng riêng biệt. Tính năng này giống hệt tính năng "Gộp phản hồi nhanh" có sẵn trong SillyTavern và cả hai sẽ được đồng bộ với nhau.</li></ul>

    <h3 id="help-thirdparty-api">API đăng ký nút cho tiện ích bên thứ ba</h3>
    <p>QR Assistant cho phép các tiện ích SillyTavern bên thứ ba đăng ký các nút tùy chỉnh vào hệ thống của QR Assistant thông qua <code>window.qrAssistantExtensionApi</code> (giúp QR Assistant có thể trực tiếp lấy và quản lý nút của tiện ích đó).</p>
    <p>Ví dụ — đăng ký một nút tùy chỉnh từ tiện ích của bạn:</p>
    <pre><code>// Đảm bảo mảng tồn tại trước khi push
if (!window.qrAssistantExtensionApi) {
    window.qrAssistantExtensionApi = [];
}

// Đăng ký nút tùy chỉnh của bạn
window.qrAssistantExtensionApi.push({
    dom_id: 'my-extension-custom-btn',       // (Bắt buộc) ID của phần tử DOM muốn lấy
    group_name: 'Tên tiện ích của tôi',       // (Tùy chọn) Tên nhóm hiển thị trong menu
    button_name: 'Chữ trên nút của tôi'       // (Tùy chọn) Chữ hiển thị trên nút; nếu bỏ qua,
                                              //         sẽ tự động dùng title hoặc textContent của phần tử
});</code></pre>
    <p><code>dom_id</code> — thuộc tính <code>id</code> của phần tử DOM mà bạn muốn QR Assistant lấy và chuyển vào menu.</p>
    <p><code>group_name</code> — Tiêu đề nhóm hiển thị phía trên nút trong menu. Nếu bỏ qua, sẽ dùng nhãn mặc định.</p>
    <p><code>button_name</code> — Văn bản hoặc class icon FontAwesome hiển thị trên nút. Hỗ trợ chữ thuần hoặc class FontAwesome, ví dụ như <code>fa-solid fa-star</code>.</p>
    <p>QR Assistant sẽ đọc danh sách đăng ký này mỗi khi nó xây dựng lại menu.</p>
    <p>Nếu bạn vẫn không hiểu, bạn có thể gửi trực tiếp đoạn hướng dẫn này cho các AI như DeepSeek!</p>

    <h3 id="help-compat">Tương thích với Input Helper và Tiện ích chuyển Preset</h3>
    <ul>
        <li>Chuyển Input Helper (bản script) vào Danh sách trắng để hiển thị bình thường các nút ký hiệu tương ứng.</li>
        <li>Đã tương thích với nút "Sách thế giới thường dùng" của tiện ích <code>Công cụ chuyển đổi Preset</code>, nút này sẽ hiển thị ở bên trái danh sách.</li>
    </ul>

    <h3 id="help-update">Kiểm tra cập nhật</h3>
    <ul>
        <li>Bên cạnh tính năng kiểm tra cập nhật có sẵn của SillyTavern trong trang <code>Quản lý tiện ích mở rộng</code>, tiện ích này cũng có khả năng tự động kiểm tra phiên bản mới. Mỗi 24 giờ sẽ tự động kiểm tra một lần. Nếu có phiên bản mới, biểu tượng <code>NEW</code> sẽ xuất hiện và nút <code>Kiểm tra phiên bản</code> sẽ chuyển thành tiêu đề <code>Đã tìm thấy phiên bản mới</code> màu đỏ. Nhấp vào <code>Đã tìm thấy phiên bản mới</code> để xem nhật ký cập nhật và nhanh chóng tiến hành cập nhật.</li>
        <li>Nếu cập nhật thất bại, bạn có thể cập nhật QR Assistant thủ công trong danh sách <code>Quản lý tiện ích mở rộng</code>. Nếu vẫn không thành công, bạn có thể thử xóa và cài đặt lại để sử dụng phiên bản mới nhất.</li>
    </ul>
    <div style="height: 100px;"></div>
`
};

// === Khối đa ngôn ngữ Thông báo cập nhật ===
export const announcementDocs = {
    'en': `
    <h3 style="text-align: center; margin-top: 0;">QR Assistant (2026/4/29)</h3>
    <h4 style="margin-top: 15px; margin-bottom: 5px;">Major Updates & Optimizations</h4>
    <ul style="padding-left: 20px; margin-top: 0;">
        <li>You can now customize the sorting of buttons in the menu panel. Open "Button Sorting" in the QR Assistant settings page, enable the feature, and drag to sort.</li>
        <li>Reduced the opening speed of the QR menu panel (reduced latency).</li>
        <li>Added Traditional Chinese / English support.</li>
        <li>Supported setting the current character card image as the button icon, and provided an image rotation feature (disabled by default).</li>
    </ul>
    <h4 style="margin-top: 15px; margin-bottom: 5px;">Others</h4>
    <ul style="padding-left: 20px; margin-top: 0;">
        <li>QR Assistant allows specific QR/script buttons to remain above the chat input box. Just put the corresponding buttons into the "Whitelist".</li>
        <li>Finally, detailed information and the manual of the extension can be found in the "Usage Guide" on the settings page.</li>
    </ul>
    `,

    'zh-tw': `
    <h3 style="text-align: center; margin-top: 0;">QR Assistant（2026/4/29）</h3>
    <h4 style="margin-top: 15px; margin-bottom: 5px;">Cập nhật & Tối ưu chính</h4>
    <ul style="padding-left: 20px; margin-top: 0;">
        <li>Hiện tại đã hỗ trợ sắp xếp tùy chỉnh các nút trong menu. Hãy mở "Sắp xếp nút menu" trong trang cài đặt tiện ích QR Assistant, bật tính năng này và thực hiện kéo thả để tự do sắp xếp.</li>
        <li>Giảm thời gian mở menu QR (giảm độ trễ).</li>
        <li>Cung cấp hỗ trợ đa ngôn ngữ Phồn thể / Tiếng Anh.</li>
        <li>Hỗ trợ lấy ảnh thẻ nhân vật hiện tại làm biểu tượng nút, đồng thời cung cấp tính năng xoay ảnh (mặc định tắt).</li>
    </ul>
    <h4 style="margin-top: 15px; margin-bottom: 5px;">Khác</h4>
    <ul style="padding-left: 20px; margin-top: 0;">
        <li>QR Assistant cho phép bạn giữ lại các nút QR/Script cụ thể phía trên hộp nhập liệu chat, bạn chỉ cần đưa các nút tương ứng vào "Danh sách trắng".</li>
        <li>Cuối cùng, thông tin chi tiết và hướng dẫn sử dụng của tiện ích có thể xem trong "Hướng dẫn sử dụng" ở trang cài đặt.</li>
    </ul>
    `,

    'zh-cn': `
    <h3 style="text-align: center; margin-top: 0;">QR Assistant（2026/4/29）</h3>
    <h4 style="margin-top: 15px; margin-bottom: 5px;">Cập nhật & Tối ưu chính</h4>
    <ul style="padding-left: 20px; margin-top: 0;">
        <li>Hiện tại đã hỗ trợ sắp xếp tùy chỉnh các nút trong menu. Hãy mở "Sắp xếp nút menu" trong trang cài đặt tiện ích QR Assistant, bật tính năng này và thực hiện kéo thả để tự do sắp xếp.</li>
        <li>Giảm thời gian mở menu QR (giảm độ trễ).</li>
        <li>Cung cấp hỗ trợ đa ngôn ngữ Phồn thể / Tiếng Anh.</li>
        <li>Hỗ trợ lấy ảnh thẻ nhân vật hiện tại làm biểu tượng nút, đồng thời cung cấp tính năng xoay ảnh (mặc định tắt).</li>
    </ul>
    <h4 style="margin-top: 15px; margin-bottom: 5px;">Khác</h4>
    <ul style="padding-left: 20px; margin-top: 0;">
        <li>QR Assistant cho phép bạn giữ lại các nút QR/Script cụ thể phía trên hộp nhập liệu chat, bạn chỉ cần đưa các nút tương ứng vào "Danh sách trắng".</li>
        <li>Cuối cùng, thông tin chi tiết và hướng dẫn sử dụng của tiện ích có thể xem trong "Hướng dẫn sử dụng" ở trang cài đặt.</li>
    </ul>
    `
};
