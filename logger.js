// logger.js - Module cốt lõi ghi nhật ký (Log)

export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    OFF: 4
};

export const LogCategory = {
    SYSTEM: 'System',
    API: 'API',
    UI: 'UI',
    WHITELIST: 'Whitelist',
    UPDATE: 'Update',
    CORE: 'Core'
};

class LoggerSystem {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Giới hạn số lượng nhật ký lưu trữ trong bộ nhớ
        this.currentLevel = LogLevel.INFO; // Cấp độ mặc định (INFO)
        this.listeners = [];
    }

    /**
     * Đặt cấp độ nhật ký
     * @param {number} level
     */
    setLevel(level) {
        this.currentLevel = level;
    }

    /**
     * Thêm nhật ký
     * @param {number} level - Cấp độ nhật ký
     * @param {string} category - Phân loại nhật ký
     * @param {string} message - Nội dung tin nhắn
     * @param {any} [data] - Dữ liệu bổ sung
     */
    _add(level, category, message, data = null) {
        // Sửa đổi: Không chặn các nhật ký cấp thấp ở đầu vào nữa, đảm bảo ghi lại tất cả lịch sử trong bộ nhớ
        // if (level < this.currentLevel) return;

        // Xử lý đặc biệt đối tượng Error, vì JSON.stringify(new Error()) sẽ trả về {}
        // Chúng ta cần trích xuất rõ ràng các thuộc tính của nó để xuất JSON và hiển thị (render) UI sau này
        let safeData = data;
        if (data instanceof Error) {
            safeData = {
                name: data.name,
                message: data.message,
                stack: data.stack,
                isError: true // Đánh dấu đây là một đối tượng lỗi
            };
        }

        const timestamp = new Date().toISOString();
        const logEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp,
            levelName: Object.keys(LogLevel).find(key => LogLevel[key] === level),
            level,
            category,
            message,
            data: safeData
        };

        this.logs.push(logEntry);

        // Duy trì độ dài hàng đợi
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Sửa đổi: Chỉ xuất ra bảng điều khiển trình duyệt khi đáp ứng cấp độ hiện tại, tránh trôi màn hình (spam)
        if (level >= this.currentLevel) {
            this._consolePrint(logEntry);
        }

        // Thông báo cho các trình lắng nghe (dùng để cập nhật UI)
        this._notifyListeners(logEntry);
    }

    _consolePrint(entry) {
        const style = `color: ${this._getColor(entry.level)}; font-weight: bold;`;
        // Thêm tiền tố tên plugin để dễ dàng lọc trong bảng điều khiển
        const prefix = `[QR Assistant] [${entry.category}]`;
        if (entry.data) {
            console.log(`%c${prefix} ${entry.message}`, style, entry.data);
        } else {
            console.log(`%c${prefix} ${entry.message}`, style);
        }
    }

    _getColor(level) {
        switch (level) {
            case LogLevel.ERROR: return '#d32f2f';
            case LogLevel.WARN: return '#f57c00';
            case LogLevel.DEBUG: return '#757575';
            default: return '#1976d2';
        }
    }

    debug(category, message, data) { this._add(LogLevel.DEBUG, category, message, data); }
    info(category, message, data) { this._add(LogLevel.INFO, category, message, data); }
    warn(category, message, data) { this._add(LogLevel.WARN, category, message, data); }
    error(category, message, data) { this._add(LogLevel.ERROR, category, message, data); }

    /**
     * Xuất nhật ký dưới dạng văn bản
     */
    exportLogs() {
        return this.logs.map(log => {
            const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
            return `[${log.timestamp}] [${log.levelName}] [${log.category}] ${log.message}${dataStr}`;
        }).join('\n');
    }

    /**
     * Xóa sạch nhật ký
     */
    clear() {
        this.logs = [];
        this._notifyListeners(null); // null được xem là tín hiệu xóa sạch
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    _notifyListeners(entry) {
        this.listeners.forEach(cb => cb(entry, this.logs));
    }

    getDomStructure(rootId = 'send_form') {
        const root = document.getElementById(rootId);
        if (!root) return `[${rootId} not found]`;

        const traverse = (el, depth = 0) => {
            const indent = '  '.repeat(depth);
            let info = `${indent}<${el.tagName.toLowerCase()}`;

            if (el.id) info += ` id="${el.id}"`;
            if (el.className) info += ` class="${el.className}"`;

            if (el.classList.contains('qrq-hidden-by-plugin')) info += ` [HIDDEN]`;
            if (el.classList.contains('qrq-whitelisted-original')) info += ` [WHITELISTED]`;

            info += '>';

            if (el.children.length > 0) {
                const childInfo = Array.from(el.children).map(child => traverse(child, depth + 1)).join('\n');
                return `${info}\n${childInfo}`;
            } else {
                return info;
            }
        };

        return traverse(root);
    }
}

export const Logger = new LoggerSystem();

