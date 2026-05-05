import React from 'react';
import { useNavigate } from 'react-router';
import { getLaptopsByIds } from '../data/laptops.ts';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { compare, toggleCompare } = useStore();
  const laptops = getLaptopsByIds(compare);

  if (laptops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl text-gray-900 mb-4">No Products to Compare</h2>
            <p className="text-gray-600 mb-6">Add products to compare by clicking the compare checkbox on product cards.</p>
            <Button onClick={() => navigate('/')}>Browse Products</Button>
          </div>
        </div>
      </div>
    );
  }

  const specs = [
    { label: 'Price', key: 'price', format: (val: any) => `$${val}` },
    { label: 'CPU', key: 'cpu' },
    { label: 'GPU', key: 'gpu' },
    { label: 'RAM', key: 'ram' },
    { label: 'Storage', key: 'storage', extra: 'storageType' },
    { label: 'Screen Size', key: 'screenSize' },
    { label: 'Weight', key: 'weight' },
    { label: 'Battery', key: 'batteryCondition' },
    { label: 'Condition', key: 'condition' },
    { label: 'Rating', key: 'rating', format: (val: any) => `${val}/5` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl text-gray-900 mb-8">Compare Products</h1>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 bg-gray-50 w-48">Specification</th>
                  {laptops.map((laptop) => (
                    <th key={laptop.id} className="p-4 bg-gray-50 min-w-[250px]">
                      <div className="relative">
                        <button
                          onClick={() => toggleCompare(laptop.id)}
                          className="absolute top-0 right-0 p-1 hover:bg-gray-200 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="pr-6">
                          <img
                            src={laptop.image}
                            alt={laptop.name}
                            className="w-full aspect-[4/3] object-cover rounded-lg mb-3"
                          />
                          <h3 className="text-sm text-gray-900 mb-1">{laptop.name}</h3>
                          <p className="text-xs text-gray-500">{laptop.brand}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, idx) => {
                  const values = laptops.map((laptop) => {
                    const value = laptop[spec.key as keyof typeof laptop];
                    if (spec.extra) {
                      return `${value} ${laptop[spec.extra as keyof typeof laptop]}`;
                    }
                    return spec.format ? spec.format(value) : value;
                  });

                  // Find best value for highlighting
                  let bestIndices: number[] = [];
                  if (spec.key === 'price') {
                    const minPrice = Math.min(...laptops.map((l) => l.price));
                    bestIndices = laptops.map((l, i) => (l.price === minPrice ? i : -1)).filter((i) => i !== -1);
                  } else if (spec.key === 'rating') {
                    const maxRating = Math.max(...laptops.map((l) => l.rating));
                    bestIndices = laptops.map((l, i) => (l.rating === maxRating ? i : -1)).filter((i) => i !== -1);
                  }

                  return (
                    <tr key={idx} className="border-b">
                      <td className="p-4 text-gray-900 bg-gray-50">{spec.label}</td>
                      {values.map((value, valIdx) => (
                        <td
                          key={valIdx}
                          className={`p-4 text-gray-700 ${
                            bestIndices.includes(valIdx) ? 'bg-green-50 font-medium text-green-700' : ''
                          }`}
                        >
                          {typeof value === 'object' && value !== null ? JSON.stringify(value) : value}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td className="p-4 bg-gray-50"></td>
                  {laptops.map((laptop) => (
                    <td key={laptop.id} className="p-4">
                      <Button
                        onClick={() => navigate(`/product/${laptop.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        View Details
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Products
          </Button>
        </div>
      </div>
    </div>
  );
};
