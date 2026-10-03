import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Resource, ResourceCategory, ResourceCondition } from '../types.ts';
import { compressImageFile } from '../utils.ts';
import { apiRequest } from '../api.ts';

interface AddEditResourceModalProps {
  isOpen: boolean;
  resourceToEdit: Resource | null;
  onClose: () => void;
  onSuccess: (resource: Resource) => void;
}

export const AddEditResourceModal: React.FC<AddEditResourceModalProps> = ({
  isOpen,
  resourceToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Books');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [condition, setCondition] = useState<ResourceCondition>('Good');
  const [image, setImage] = useState('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resourceToEdit) {
      setTitle(resourceToEdit.title);
      setCategory(resourceToEdit.category);
      setDescription(resourceToEdit.description);
      setPrice(resourceToEdit.price);
      setCondition(resourceToEdit.condition);
      setImage(resourceToEdit.image || '');
    } else {
      setTitle('');
      setCategory('Books');
      setDescription('');
      setPrice('');
      setCondition('Good');
      setImage('');
    }
    setError(null);
  }, [resourceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose an image file under 5MB.');
      return;
    }

    setIsProcessingImg(true);
    setError(null);
    try {
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.75);
      setImage(compressedDataUrl);
    } catch (err) {
      setError('Failed to process image. Please try another file.');
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide a resource title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setError('Price must be greater than 0. Free listings are not allowed.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isEdit = !!resourceToEdit;
      const resourceId = resourceToEdit?.id || resourceToEdit?._id;
      const endpoint = isEdit ? `/api/resources/${resourceId}` : '/api/resources';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          price: Number(price),
          condition,
          image,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to save listing.');
      }

      onSuccess(resData.resource);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 mb-0.5">
          {resourceToEdit ? 'Edit Resource Listing' : 'List Resource for Sale'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Provide item details for other students in your college.
        </p>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Networks 5th Edition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Books">Books</option>
                <option value="Notes / Study Material">Notes / Study Material</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ResourceCondition)}
                className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price (₹) <span className="text-slate-400 font-normal">- Paid listings only</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="250"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe edition, course semester, condition details, pencil marks, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Photo upload from device */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Photo
            </label>
            <div className="flex items-center gap-3">
              {image ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-0.5 right-0.5 p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-md border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[9px] mt-0.5">No photo</span>
                </div>
              )}

              <div>
                <input
                  type="file"
                  id="compact-resource-image"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="compact-resource-image"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingImg ? 'Processing...' : 'Upload Image'}</span>
                </label>
                <p className="mt-1 text-[11px] text-slate-500">
                  Select a picture of the book, notes, or item.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImg}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs disabled:opacity-50 transition"
            >
              {isSubmitting
                ? 'Saving...'
                : resourceToEdit
                ? 'Save Changes'
                : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
