import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store } from "lucide-react";

interface RegisterChoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RegisterChoiceDialog({ open, onOpenChange }: RegisterChoiceDialogProps) {
    const navigate = useNavigate();

    const goTo = (path: string) => {
        onOpenChange(false);
        navigate(path);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Chọn loại tài khoản</DialogTitle>
                    <DialogDescription>
                        Bạn muốn đăng ký tài khoản người mua hay người bán trên LAPTOPRE?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-auto py-4 flex items-start gap-3 text-left rounded-xl"
                        onClick={() => goTo("/register")}
                    >
                        <ShoppingBag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-foreground">Người mua</p>
                            <p className="text-sm text-muted-foreground font-normal">
                                Mua sắm laptop, theo dõi đơn hàng và ưu đãi thành viên.
                            </p>
                        </div>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-auto py-4 flex items-start gap-3 text-left rounded-xl border-primary/30 hover:border-primary"
                        onClick={() => goTo("/register/seller")}
                    >
                        <Store className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-foreground">Người bán</p>
                            <p className="text-sm text-muted-foreground font-normal">
                                Đăng ký cửa hàng, kho hàng và thông tin thanh toán.
                            </p>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
