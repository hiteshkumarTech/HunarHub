import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Wrench, Package as PackageIcon } from 'lucide-react';
import { Field, TextInput } from '../ui/Field';
import { ImageUploadField } from '../ui/ImageUploadField';
import { ConfirmAction } from '../ui/ConfirmAction';
import { buttonStyles } from '../ui/button';
import { useToast } from '../ui/Toast';
import {
  useCreateService,
  useUpdateService,
  useDeleteService,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/listings';
import { inr } from '../../lib/utils';
import type { ListingImage, ProductItem, ServiceItem } from '../../types/api';

type Kind = 'service' | 'product';
type Listing = (ServiceItem & { kind: 'service' }) | (ProductItem & { kind: 'product' });

const PRODUCT_MAX_IMAGES = 4;
const SERVICE_MAX_IMAGES = 1;

interface FormValues {
  name: string;
  price: string;
  dur: string;
  existingImages: ListingImage[];
  stagedFiles: File[];
  imagesTouched: boolean;
}

function emptyForm(): FormValues {
  return { name: '', price: '', dur: '', existingImages: [], stagedFiles: [], imagesTouched: false };
}

function toFormValues(item: Listing): FormValues {
  return {
    name: item.name,
    price: String(item.price),
    dur: item.kind === 'service' ? item.dur : '',
    existingImages: item.images,
    stagedFiles: [],
    imagesTouched: false,
  };
}

/**
 * Inline create/edit form for one listing. Follows the same disclosure
 * pattern as MyOrders' review form — expands in place, no modal.
 */
function ListingForm({
  kind,
  initial,
  onCancel,
  onSubmit,
  pending,
}: {
  kind: Kind;
  initial?: FormValues;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  pending: boolean;
}) {
  const [values, setValues] = useState<FormValues>(initial ?? emptyForm());
  const [error, setError] = useState('');
  const maxImages = kind === 'service' ? SERVICE_MAX_IMAGES : PRODUCT_MAX_IMAGES;

  function set<K extends keyof FormValues>(key: K, v: FormValues[K]) {
    setValues((f) => ({ ...f, [key]: v }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const price = Number(values.price);
    if (!values.name.trim()) return setError('Name is required.');
    if (!Number.isFinite(price) || price < 0) return setError('Enter a valid price.');
    onSubmit({ ...values, name: values.name.trim() });
  }

  return (
    <form onSubmit={submit} className="space-y-3 border-t border-line bg-surface px-5 py-4">
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" htmlFor={`listing-name`}>
          <TextInput
            id="listing-name"
            required
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={kind === 'service' ? 'e.g. Custom Terracotta Pot' : 'e.g. Painted Planter'}
          />
        </Field>
        <Field label="Price (₹)" htmlFor="listing-price">
          <TextInput
            id="listing-price"
            type="number"
            min={0}
            step="1"
            required
            value={values.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>
      {kind === 'service' && (
        <Field label="Duration" htmlFor="listing-dur">
          <TextInput id="listing-dur" value={values.dur} onChange={(e) => set('dur', e.target.value)} placeholder="e.g. 3 days" />
        </Field>
      )}
      <ImageUploadField
        label={kind === 'service' ? 'Photo' : 'Photos'}
        altPrefix={values.name || (kind === 'service' ? 'Service' : 'Product')}
        max={maxImages}
        disabled={pending}
        existing={values.existingImages}
        onRemoveExisting={(i) =>
          setValues((f) => ({ ...f, imagesTouched: true, existingImages: f.existingImages.filter((_, idx) => idx !== i) }))
        }
        staged={values.stagedFiles}
        onAddFiles={(files) => setValues((f) => ({ ...f, imagesTouched: true, stagedFiles: [...f.stagedFiles, ...files] }))}
        onRemoveStaged={(i) =>
          setValues((f) => ({ ...f, imagesTouched: true, stagedFiles: f.stagedFiles.filter((_, idx) => idx !== i) }))
        }
      />
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending} className={buttonStyles({ size: 'sm', className: 'disabled:opacity-50' })}>
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={pending} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Dashboard "Your listings" panel — an entrepreneur's own create/edit/delete UI. */
export function ListingsManager({
  services,
  products,
  isLoading,
}: {
  services: ServiceItem[];
  products: ProductItem[];
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [adding, setAdding] = useState<Kind | null>(null);
  const [editing, setEditing] = useState<{ kind: Kind; id: string } | null>(null);

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const listings: Listing[] = [
    ...services.map((s): Listing => ({ ...s, kind: 'service' })),
    ...products.map((p): Listing => ({ ...p, kind: 'product' })),
  ];

  function handleCreate(kind: Kind, values: FormValues) {
    const price = Number(values.price);
    if (kind === 'service') {
      createService.mutate(
        { name: values.name, price, dur: values.dur.trim() || undefined, image: values.stagedFiles[0] },
        {
          onSuccess: () => {
            toast('Service added.', 'success');
            setAdding(null);
          },
          onError: (err) => toast(err instanceof Error ? err.message : 'Could not add service.', 'error'),
        },
      );
    } else {
      createProduct.mutate(
        { name: values.name, price, newImages: values.stagedFiles },
        {
          onSuccess: () => {
            toast('Product added.', 'success');
            setAdding(null);
          },
          onError: (err) => toast(err instanceof Error ? err.message : 'Could not add product.', 'error'),
        },
      );
    }
  }

  function handleUpdate(kind: Kind, id: string, values: FormValues) {
    const price = Number(values.price);
    if (kind === 'service') {
      updateService.mutate(
        {
          id,
          name: values.name,
          price,
          dur: values.dur.trim() || undefined,
          image: values.stagedFiles[0],
          removeImage: values.imagesTouched && !values.stagedFiles.length && values.existingImages.length === 0,
        },
        {
          onSuccess: () => {
            toast('Service updated.', 'success');
            setEditing(null);
          },
          onError: (err) => toast(err instanceof Error ? err.message : 'Could not update service.', 'error'),
        },
      );
    } else {
      updateProduct.mutate(
        {
          id,
          name: values.name,
          price,
          newImages: values.stagedFiles,
          keepImagePublicIds: values.imagesTouched
            ? values.existingImages.map((img) => img.publicId).filter((id): id is string => id !== null)
            : undefined,
        },
        {
          onSuccess: () => {
            toast('Product updated.', 'success');
            setEditing(null);
          },
          onError: (err) => toast(err instanceof Error ? err.message : 'Could not update product.', 'error'),
        },
      );
    }
  }

  function handleDelete(kind: Kind, id: string) {
    const mutation = kind === 'service' ? deleteService : deleteProduct;
    mutation.mutate(id, {
      onSuccess: () => toast(`${kind === 'service' ? 'Service' : 'Product'} removed.`, 'success'),
      onError: (err) => toast(err instanceof Error ? err.message : 'Could not remove listing.', 'error'),
    });
  }

  const creatingPending = createService.isPending || createProduct.isPending;
  const updatingPending = updateService.isPending || updateProduct.isPending;

  return (
    <div className="rounded-xl border border-line bg-surface-2">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted">Your listings</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-muted">{listings.length}</span>
          {!adding && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setAdding('service');
                }}
                className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'gap-1' })}
              >
                <Plus size={13} /> Service
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setAdding('product');
                }}
                className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'gap-1' })}
              >
                <Plus size={13} /> Product
              </button>
            </div>
          )}
        </div>
      </div>

      {adding && (
        <ListingForm kind={adding} onCancel={() => setAdding(null)} onSubmit={(v) => handleCreate(adding, v)} pending={creatingPending} />
      )}

      {isLoading ? (
        <div className="p-6 text-[13px] text-muted">Loading…</div>
      ) : listings.length === 0 && !adding ? (
        <div className="p-8 text-center text-[13px] text-muted">
          No listings yet — add a service or product so customers can find and order from you.
        </div>
      ) : (
        <div className="divide-y divide-line">
          {listings.map((item) => {
            const isEditing = editing?.kind === item.kind && editing.id === item.id;
            const cover = item.images[0];
            return (
              <div key={`${item.kind}-${item.id}`}>
                <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3 text-[13px]">
                    {cover ? (
                      <img src={cover.url} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                    ) : item.kind === 'service' ? (
                      <Wrench size={13} className="shrink-0 text-muted" />
                    ) : (
                      <PackageIcon size={13} className="shrink-0 text-muted" />
                    )}
                    <span className="truncate font-medium text-fg">{item.name}</span>
                    {item.kind === 'service' && item.dur && <span className="shrink-0 text-[11px] text-muted">· {item.dur}</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[13px] font-semibold text-fg">{inr(item.price)}</span>
                    <button
                      type="button"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => {
                        setAdding(null);
                        setEditing(isEditing ? null : { kind: item.kind, id: item.id });
                      }}
                      className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg"
                    >
                      <Pencil size={14} />
                    </button>
                    <ConfirmAction
                      label="Delete"
                      pending={item.kind === 'service' ? deleteService.isPending : deleteProduct.isPending}
                      onConfirm={() => handleDelete(item.kind, item.id)}
                    />
                  </div>
                </div>
                {isEditing && (
                  <ListingForm
                    kind={item.kind}
                    initial={toFormValues(item)}
                    onCancel={() => setEditing(null)}
                    onSubmit={(v) => handleUpdate(item.kind, item.id, v)}
                    pending={updatingPending}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
