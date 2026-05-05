import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router';
import {ArrowLeft, Save, ImagePlus} from 'lucide-react';
import {getLaptopById} from '../../data/laptops';
import type {Laptop} from '../../types';

import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Textarea} from '../../components/ui/textarea';
import {Label} from '../../components/ui/label';
import {Checkbox} from '../../components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {Card, CardContent, CardHeader, CardTitle} from '../../components/ui/card';

export const AdminProductFormPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<Partial<Laptop>>({
        name: '', brand: '', price: 0, originalPrice: 0, image: '',
        cpu: '', gpu: '', ram: '', storage: '', storageType: 'SSD',
        screenSize: '', condition: 'Like New', description: '',
        isBestSeller: false, isHot: false, isSale: false,
    });

    useEffect(() => {
        if (isEditMode && id) {
            const product = getLaptopById(id);
            if (product) setFormData(product);
        }
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? Number(value) : value}));
    };

    const handleSelectChange = (name: string, value: string) => setFormData(prev => ({...prev, [name]: value}));
    const handleCheckedChange = (name: string, checked: boolean) => setFormData(prev => ({...prev, [name]: checked}));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        navigate('/admin/products');
    };

    return (
        <form onSubmit={handleSubmit}
              className="relative pb-24 md:pb-10 max-w-5xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}
                        className="rounded-full bg-white shadow-sm border border-slate-200">
                    <ArrowLeft className="w-5 h-5 text-slate-700"/>
                </Button>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                    {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Tên sản phẩm <span
                                    className="text-red-500">*</span></Label>
                                <Input required name="name" value={formData.name || ''} onChange={handleChange}
                                       className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"/>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Hãng sản xuất <span
                                        className="text-red-500">*</span></Label>
                                    <Select value={formData.brand}
                                            onValueChange={(val) => handleSelectChange('brand', val)}>
                                        <SelectTrigger
                                            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"><SelectValue
                                            placeholder="Chọn hãng"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dell">Dell</SelectItem>
                                            <SelectItem value="HP">HP</SelectItem>
                                            <SelectItem value="Asus">Asus</SelectItem>
                                            <SelectItem value="Lenovo">Lenovo</SelectItem>
                                            <SelectItem value="Apple">Apple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Tình trạng <span
                                        className="text-red-500">*</span></Label>
                                    <Select value={formData.condition}
                                            onValueChange={(val) => handleSelectChange('condition', val)}>
                                        <SelectTrigger
                                            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"><SelectValue
                                            placeholder="Tình trạng"/></SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            <SelectItem value="Like New">Like New</SelectItem>
                                            <SelectItem value="99%">99%</SelectItem>
                                            <SelectItem value="Good">Good</SelectItem>
                                            <SelectItem value="Refurbished">Refurbished</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Giá bán ($) <span
                                        className="text-red-500">*</span></Label>
                                    <Input required type="number" name="price" value={formData.price || ''}
                                           onChange={handleChange}
                                           className="h-11 rounded-xl bg-slate-50 font-semibold text-blue-700"/>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Giá gốc</Label>
                                    <Input type="number" name="originalPrice" value={formData.originalPrice || ''}
                                           onChange={handleChange} className="h-11 rounded-xl bg-slate-50"/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Mô tả chi tiết</Label>
                                <Textarea name="description" value={formData.description || ''} onChange={handleChange}
                                          rows={5}
                                          className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white resize-none"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Thông số kỹ thuật</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
                            <div className="space-y-2"><Label>CPU</Label><Input name="cpu" value={formData.cpu || ''}
                                                                                onChange={handleChange}
                                                                                className="h-11 rounded-xl"/></div>
                            <div className="space-y-2"><Label>GPU</Label><Input name="gpu" value={formData.gpu || ''}
                                                                                onChange={handleChange}
                                                                                className="h-11 rounded-xl"/></div>
                            <div className="space-y-2">
                                <Label>RAM</Label>
                                <Select value={formData.ram} onValueChange={(val) => handleSelectChange('ram', val)}>

                                    <SelectTrigger className="h-11 rounded-xl bg-blue-50 border-blue-200">
                                        <SelectValue placeholder="Chọn RAM"/>
                                    </SelectTrigger>


                                    <SelectContent className="z-[100] bg-blue-50 border-blue-200">
                                        <SelectItem value="8GB"
                                                    className="focus:bg-blue-100 cursor-pointer">8GB</SelectItem>
                                        <SelectItem value="16GB"
                                                    className="focus:bg-blue-100 cursor-pointer">16GB</SelectItem>
                                        <SelectItem value="32GB"
                                                    className="focus:bg-blue-100 cursor-pointer">32GB</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Loại Ổ cứng</Label>
                                <Select value={formData.storageType}
                                        onValueChange={(val) => handleSelectChange('storageType', val)}>
                                    {/* Thêm bg-blue-50 cho nút Trigger */}
                                    <SelectTrigger className="h-11 rounded-xl bg-blue-50 border-blue-200">
                                        <SelectValue placeholder="Loại ổ cứng"/>
                                    </SelectTrigger>


                                    <SelectContent className="z-[100] bg-blue-50 border-blue-200">
                                        <SelectItem value="SSD"
                                                    className="focus:bg-blue-100 cursor-pointer">SSD</SelectItem>
                                        <SelectItem value="HDD"
                                                    className="focus:bg-blue-100 cursor-pointer">HDD</SelectItem>
                                        <SelectItem value="SSD + HDD" className="focus:bg-blue-100 cursor-pointer">SSD +
                                            HDD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Dung lượng Ổ cứng</Label><Input name="storage"
                                                                                              value={formData.storage || ''}
                                                                                              onChange={handleChange}
                                                                                              className="h-11 rounded-xl"/>
                            </div>
                            <div className="space-y-2"><Label>Màn hình</Label><Input name="screenSize"
                                                                                     value={formData.screenSize || ''}
                                                                                     onChange={handleChange}
                                                                                     className="h-11 rounded-xl"/></div>
                        </CardContent>
                    </Card>
                </div>


                <div className="space-y-6">
                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Hình ảnh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div
                                className="w-full aspect-square md:aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden relative group">
                                {formData.image ? (
                                    <>
                                        <img src={formData.image} alt="Preview"
                                             className="w-full h-full object-contain p-4"/>
                                        <div
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-sm font-medium">Đổi ảnh</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-400 flex flex-col items-center">
                                        <ImagePlus className="w-10 h-10 mb-2 opacity-50"/>
                                        <span className="text-sm font-medium">Chưa có ảnh</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL
                                    Hình ảnh</Label>
                                <Input name="image" value={formData.image || ''} onChange={handleChange}
                                       placeholder="https://..." className="h-11 rounded-xl bg-slate-50"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Trạng thái (Huy
                                hiệu)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div
                                className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <Checkbox id="isBestSeller" checked={formData.isBestSeller}
                                          onCheckedChange={(c) => handleCheckedChange('isBestSeller', c as boolean)}
                                          className="w-5 h-5 rounded-md"/>
                                <Label htmlFor="isBestSeller"
                                       className="cursor-pointer flex-1 font-medium text-slate-700">Best Seller (Bán
                                    chạy)</Label>
                            </div>
                            <div
                                className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <Checkbox id="isHot" checked={formData.isHot}
                                          onCheckedChange={(c) => handleCheckedChange('isHot', c as boolean)}
                                          className="w-5 h-5 rounded-md"/>
                                <Label htmlFor="isHot" className="cursor-pointer flex-1 font-medium text-slate-700">Hot
                                    Deal (Lửa)</Label>
                            </div>
                            <div
                                className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <Checkbox id="isSale" checked={formData.isSale}
                                          onCheckedChange={(c) => handleCheckedChange('isSale', c as boolean)}
                                          className="w-5 h-5 rounded-md"/>
                                <Label htmlFor="isSale" className="cursor-pointer flex-1 font-medium text-slate-700">Đang
                                    Sale (Giảm giá)</Label>
                            </div>
                        </CardContent>
                    </Card>


                    <div className="hidden lg:block">
                        <Button type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-base shadow-lg hover:shadow-blue-500/25 transition-all">
                            <Save className="w-5 h-5 mr-2"/>
                            {isEditMode ? 'Lưu cập nhật' : 'Thêm sản phẩm mới'}
                        </Button>
                    </div>
                </div>
            </div>


            <div
                className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <Button type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-base font-semibold shadow-md">
                    <Save className="w-5 h-5 mr-2"/>
                    {isEditMode ? 'Lưu cập nhật' : 'Thêm sản phẩm'}
                </Button>
            </div>
        </form>
    );
};