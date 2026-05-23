import React from 'react';
import { useNavigate } from 'react-router';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useStore } from '../context/StoreContext';

const LoginPromptDialog: React.FC = () => {
  const { loginPromptOpen, setLoginPromptOpen } = useStore();
  const navigate = useNavigate();

  const handleConfirm = () => {
    setLoginPromptOpen(false);
    navigate('/login');
  };

  return (
    <AlertDialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn chưa đăng nhập</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn chuyển đến trang đăng nhập không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Đăng nhập ngay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginPromptDialog;
