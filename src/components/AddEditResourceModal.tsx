import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { Resource, ResourceCategory, ResourceCondition } from '../types.ts';
import { compressImageFile } from '../utils.ts';

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

    // Check size limit: max 5MB file before compression
    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose an image under 5MB.');
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

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-1">
          {resourceToEdit ? 'Edit Resource Listing' : 'List a Campus Resource'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Offer your books, notes, or stationery to fellow students on campus.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Title / Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Operating Systems Principles (Galvin 9th Ed)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold text-sm">
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
                className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Device Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Photo (Stored in MongoDB)
            </label>
            <div className="mt-1 flex items-center gap-4">
              {image ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded hover:bg-rose-700 transition"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px] mt-1">No Photo</span>
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  id="resource-image-input"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resource-image-input"
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingImg ? 'Compressing...' : 'Upload from Device'}</span>
                </label>
                <p className="mt-1 text-[11px] text-slate-500">
                  JPG, PNG up to 5MB. Automatically compressed before saving.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImg}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition"
            >
              {isSubmitting
                ? 'Saving...'
                : resourceToEdit
                ? 'Save Listing Changes'
                : 'Publish Resource Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
