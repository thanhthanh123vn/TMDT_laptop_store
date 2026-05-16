export const getErrorMessage = (err: any, fallback: string = "Có lỗi xảy ra. Vui lòng thử lại."): string => {
    if (!err) return fallback;
    
    // Nếu là string thì dùng luôn
    if (typeof err === 'string') return err;
    
    // Nếu có response từ axios
    const data = err.response?.data;
    if (data) {
        if (typeof data === 'string') return data;
        if (data.message && typeof data.message === 'string') return data.message;
        if (data.error && typeof data.error === 'string') return data.error;
    }
    
    // Nếu có message trực tiếp (Error object)
    if (err.message && typeof err.message === 'string') return err.message;
    
    return fallback;
};
