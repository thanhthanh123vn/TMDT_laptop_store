import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import { getLaptopById as getMockLaptopById, getReviewsByLaptopId } from '../data/laptops';
import { useStore } from '../context/StoreContext';
import { productApi } from '../api/productApi';
import type { Review, Laptop } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'specs'>('description');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewImage, setNewReviewImage] = useState<string | null>(null);
  const [addedReviews, setAddedReviews] = useState<Review[]>([]);

  const { addToCart, toggleWishlist, wishlist } = useStore();

  const [laptop, setLaptop] = useState<Laptop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaptop = async () => {
      try {
        const res = await productApi.getProductById(id || '');
        if (res.data) {
          const p = res.data;
          setLaptop({
            ...p,
            id: p.id.toString(),
            image: p.imageUrl || '/placeholder.svg',
            price: Number(p.price),
            category: p.category ? p.category.split(',') : []
          });
        } else {
          setLaptop(getMockLaptopById(id || '') || null);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setLaptop(getMockLaptopById(id || '') || null);
      } finally {
        setLoading(false);
      }
    };
    fetchLaptop();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!laptop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-500">
        Product not found
      </div>
    );
  }

  const isInWishlist = wishlist.includes(laptop.id);

  const images = laptop.images && laptop.images.length > 0 ? laptop.images : [laptop.image];
  const productReviews = getReviewsByLaptopId(laptop.id);
  const allReviews = [...addedReviews, ...productReviews];

  return (
    <main className="container mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" className="flex mb-8 text-sm text-gray-500">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
          <li><span>/</span></li>
          <li><Link to="/" className="hover:text-blue-600">Laptops</Link></li>
          <li><span>/</span></li>
          <li className="text-gray-900 font-medium">{laptop.name}</li>
        </ol>
      </nav>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16" data-purpose="product-main-view">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-video bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden p-8">
            <img
              alt={`${laptop.name} Main View`}
              className="max-h-full object-contain"
              src={images[selectedImage]}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square border ${selectedImage === idx ? 'border-blue-600 border-2' : 'border-gray-200'} rounded-lg overflow-hidden p-2 bg-white hover:border-blue-600 transition-colors`}
              >
                <img alt={`Thumbnail ${idx + 1}`} className="object-contain w-full h-full" src={img} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-start">
          <div className="mb-6">
            {laptop.isBestSeller && (
              <span className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2">
                Best Seller
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{laptop.name}</h1>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 fill-current ${i < Math.floor(laptop.rating) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <span className="text-gray-500 text-sm">({laptop.reviewCount} reviews)</span>
              <span className="text-green-600 font-semibold text-sm flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span> In Stock
              </span>
            </div>
            <p className="text-gray-600 mb-6">{laptop.description}</p>
          </div>

          {/* Pricing */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-baseline space-x-3 mb-1">
              <span className="text-4xl font-bold text-blue-600">${laptop.price}</span>
              {laptop.originalPrice && (
                <span className="text-xl text-gray-400 line-through">${laptop.originalPrice}</span>
              )}
              {laptop.discount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{laptop.discount}%</span>
              )}
            </div>
            <p className="text-sm text-gray-500">Giá tốt nhất thị trường, bao gồm bảo hành 12 tháng.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-3 border border-gray-100 rounded-lg flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="16" rx="2" ry="2" width="16" x="4" y="4"></rect><line x1="9" x2="9" y1="9" y2="15"></line><line x1="15" x2="15" y1="9" y2="15"></line><line x1="9" x2="15" y1="9" y2="9"></line><line x1="9" x2="15" y1="15" y2="15"></line></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">CPU</p>
                <p className="text-sm font-semibold truncate max-w-[120px]" title={laptop.cpu}>{laptop.cpu}</p>
              </div>
            </div>
            <div className="p-3 border border-gray-100 rounded-lg flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12h20M2 12V4a2 2 0 012-2h16a2 2 0 012 2v8M2 12v8a2 2 0 002 2h16a2 2 0 002-2v-8"></path><line x1="6" x2="6" y1="16" y2="16"></line><line x1="10" x2="10" y1="16" y2="16"></line></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">RAM</p>
                <p className="text-sm font-semibold">{laptop.ram}</p>
              </div>
            </div>
            <div className="p-3 border border-gray-100 rounded-lg flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">STORAGE</p>
                <p className="text-sm font-semibold">{laptop.storage} {laptop.storageType}</p>
              </div>
            </div>
            <div className="p-3 border border-gray-100 rounded-lg flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">Display</p>
                <p className="text-sm font-semibold truncate max-w-[120px]" title={laptop.screenSize}>{laptop.screenSize}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => addToCart(laptop)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>ADD TO CART</span>
            </button>
            <button
              onClick={() => toggleWishlist(laptop.id)}
              className={`flex-none bg-white hover:bg-gray-50 border border-gray-200 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 ${isInWishlist ? 'text-red-500' : 'text-gray-700'}`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500' : ''}`} />
              <span className="sm:hidden lg:inline">{isInWishlist ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
            <li className="mr-2" role="presentation">
              <button
                onClick={() => setActiveTab('description')}
                className={`inline-block p-4 rounded-t-lg transition-colors ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              >
                Mô tả (Description)
              </button>
            </li>
            <li className="mr-2" role="presentation">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`inline-block p-4 rounded-t-lg transition-colors ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              >
                Đánh giá (Reviews)
              </button>
            </li>
            <li className="mr-2" role="presentation">
              <button
                onClick={() => setActiveTab('specs')}
                className={`inline-block p-4 rounded-t-lg transition-colors ${activeTab === 'specs' ? 'text-blue-600 border-b-2 border-blue-600' : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              >
                Thông số kỹ thuật (Full Specs)
              </button>
            </li>
          </ul>
        </div>
        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <p className="mb-4">{laptop.description}</p>
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4">Tại sao nên chọn {laptop.name} tại Laptop Store Online?</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Máy được tuyển chọn kỹ lưỡng, ngoại hình như mới 98-99%.</li>
                <li>Đã qua kiểm tra 20 bước nghiêm ngặt bởi kỹ thuật viên.</li>
                <li>Hỗ trợ nâng cấp RAM, SSD với giá gốc.</li>
                <li>Bảo hành 12 tháng phần cứng, phần mềm trọn đời.</li>
              </ul>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Rating Summary */}
              <div className="lg:col-span-1">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Ratings</h3>
                <div className="flex items-center mb-4">
                  <span className="text-5xl font-bold text-blue-600 mr-4">{laptop.rating}</span>
                  <div>
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 fill-current ${i < Math.floor(laptop.rating) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Based on {laptop.reviewCount} reviews</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm">
                    <span className="w-12 text-gray-600">5 star</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-500">85%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-12 text-gray-600">4 star</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-500">10%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-12 text-gray-600">3 star</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-500">5%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-12 text-gray-600">2 star</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-500">0%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-12 text-gray-600">1 star</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-500">0%</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>

                {showReviewForm && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className={`w-6 h-6 cursor-pointer fill-current ${star <= newReviewRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="What do you think about this product?"
                        value={newReviewContent}
                        onChange={(e) => setNewReviewContent(e.target.value)}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewReviewImage(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                      {newReviewImage && (
                        <img src={newReviewImage} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-md border border-gray-200" />
                      )}
                    </div>
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      onClick={() => {
                        if (!newReviewContent.trim()) return;
                        const newReviewObj: Review = {
                          id: 'r' + Date.now(),
                          laptopId: laptop.id,
                          userName: 'You',
                          rating: newReviewRating,
                          date: new Date().toISOString().split('T')[0],
                          comment: newReviewContent,
                        };
                        if (newReviewImage) {
                          (newReviewObj as any).image = newReviewImage;
                        }
                        setAddedReviews([newReviewObj, ...addedReviews]);
                        setNewReviewContent('');
                        setNewReviewImage(null);
                        setNewReviewRating(5);
                        setShowReviewForm(false);
                      }}
                    >
                      Post Review
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                {allReviews.length > 0 ? (
                  <div className="space-y-8">
                    {allReviews.map((review, index) => (
                      <div key={review.id} className={`${index !== 0 ? 'pt-8 border-t border-gray-100' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{review.userName}</h4>
                          <span className="text-sm text-gray-400">
                            {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex text-yellow-400 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 fill-current ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        {(review as any).image && (
                          <img src={(review as any).image} alt="Review attachment" className="mt-4 h-32 w-auto object-contain rounded border border-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                    Chưa có đánh giá nào cho sản phẩm này.
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="text-gray-600">
              <div className="overflow-hidden border border-gray-200 rounded-xl mt-4">
                <table className="min-w-full divide-y divide-gray-200" id="specs-table">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500 bg-gray-50 w-1/4">Processor</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.cpu}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500 bg-gray-50">Memory</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.ram}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500 bg-gray-50">Storage</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.storage} {laptop.storageType}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500 bg-gray-50">Graphics</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.gpu}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500 bg-gray-50">Display</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.screenSize}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500 bg-gray-50">Weight</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.weight}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500 bg-gray-50">Condition</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.condition}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
