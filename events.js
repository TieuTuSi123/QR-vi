import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';
import { triggerQuickReply, triggerJsRunnerScript, triggerLwbTask, triggerRawDom } from './api.js';
import * as Constants from './constants.js';
import { Logger, LogCategory } from './logger.js';

export function handleRocketButtonClick() {
    Logger.info(LogCategory.CORE, 'Người dùng nhấp vào nút menu - Ảnh chụp DOM:', {
        domStructure: Logger.getDomStructure('send_form')
    });

    setMenuVisible(!sharedState.menuVisible);
    updateMenuVisibilityUI();
}

export function handleOutsideClick(event) {
    const { menu, rocketButton } = sharedState.domElements;
    // Đóng khi nhấp bên ngoài menu
    if (sharedState.menuVisible && menu && !menu.contains(event.target) && !rocketButton.contains(event.target)) {
        setMenuVisible(false);
        updateMenuVisibilityUI();
    }
}

export function handleQuickReplyClick(event) {
    const button = event.currentTarget;
    // Thêm domId vào danh sách phân rã
    const { label, isStandard, setName, source, isApiBased, buttonId, scriptId, taskId, domId } = button.dataset;

    // Đóng menu
    setMenuVisible(false);
    updateMenuVisibilityUI();

    if (source === 'JSSlashRunner') {
        triggerJsRunnerScript({ isApiBased: isApiBased === 'true', buttonId, scriptId });
    } else if (source === 'LittleWhiteBox') {
        triggerLwbTask(taskId);
    } else if (source === 'RawDomElement') {
        // Kích hoạt nhấp chuột vào DOM gốc
        triggerRawDom(domId);
    } else {
        triggerQuickReply(setName, label);
    }
}

export function setupEventListeners() {
    const btn = sharedState.domElements.rocketButton;
    if (btn) btn.addEventListener('click', handleRocketButtonClick);
    document.addEventListener('click', handleOutsideClick, true);
    // Phím ESC để đóng menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sharedState.menuVisible) {
            setMenuVisible(false);
            updateMenuVisibilityUI();
        }
    });
    // Lắng nghe bảng cài đặt được xử lý trong settings.js
}
