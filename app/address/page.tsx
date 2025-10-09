"use client";
import { useEffect, useMemo, useState } from "react";

type Address = {
  id: number;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<Omit<Address, "id">>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/address", { cache: "no-store" });
        const json = await res.json();
        if (res.ok) setAddresses(json.data as Address[]);
      } catch (e) {
        // noop
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const isEdit = useMemo(() => editingId !== null, [editingId]);

  const resetForm = () => {
    setForm({
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
    });
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.line1 || !form.city || !form.country || !form.postalCode) return;
    try {
      if (isEdit && editingId !== null) {
        const res = await fetch(`/api/address/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (res.ok) {
          setAddresses((prev) => prev.map((a) => (a.id === editingId ? (json.data as Address) : a)));
        }
      } else {
        const res = await fetch("/api/address" , {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (res.ok) {
          setAddresses((prev) => [json.data as Address, ...prev]);
        }
      }
    } catch (e) {
      // noop
    }
    resetForm();
  };

  const onEdit = (id: number) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    const { id: _id, ...rest } = a;
    setForm(rest);
    setEditingId(id);
  };

  const onDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/address/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        if (editingId === id) resetForm();
      }
    } catch (e) {
      // noop
    }
  };

  return (
    <main className="lg:mx-20 sm:mx-8 mx-4 mt-6" data-testid="address-page">
      <h1 className=" headTitle px-2 py-2 sm:text-3xl text-2xl text-secondary font-extrabold">Addresses</h1>

      <section className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
        <form onSubmit={submit} className="ring-1 ring-lightGray rounded-md p-4 bg-white" data-testid="address-form">
          <h2 className="text-xl font-semibold mb-3">{isEdit ? "Edit Address" : "New Address"}</h2>
          <div className="grid gap-3">
            <input 
              className="ring-1 ring-lightGray rounded px-3 py-2" 
              placeholder="Full name" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              data-testid="af-name" 
            />
            <input 
              className="ring-1 ring-lightGray rounded px-3 py-2" 
              placeholder="Address line 1" 
              value={form.line1} 
              onChange={(e) => setForm({ ...form, line1: e.target.value })} 
              data-testid="af-line1" 
            />
            <input 
              className="ring-1 ring-lightGray rounded px-3 py-2" 
              placeholder="Address line 2 (optional)" 
              value={form.line2} 
              onChange={(e) => setForm({ ...form, line2: e.target.value })} 
              data-testid="af-line2" 
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                className="ring-1 ring-lightGray rounded px-3 py-2" 
                placeholder="City" 
                value={form.city} 
                onChange={(e) => setForm({ ...form, city: e.target.value })} 
                data-testid="af-city" 
              />
              <input 
                className="ring-1 ring-lightGray rounded px-3 py-2" 
                placeholder="State/Region" 
                value={form.state} 
                onChange={(e) => setForm({ ...form, state: e.target.value })} 
                data-testid="af-state" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                className="ring-1 ring-lightGray rounded px-3 py-2" 
                placeholder="Postal code" 
                value={form.postalCode} 
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })} 
                data-testid="af-postal" 
              />
              <input 
                className="ring-1 ring-lightGray rounded px-3 py-2" 
                placeholder="Country" 
                value={form.country} 
                onChange={(e) => setForm({ ...form, country: e.target.value })} 
                data-testid="af-country" 
              />
            </div>
            <input 
              className="ring-1 ring-lightGray rounded px-3 py-2" 
              placeholder="Phone (optional)" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              data-testid="af-phone" 
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className=" bg-primary text-highLight rounded px-4 py-2" data-testid="af-submit">
              {isEdit ? "Update" : "Create"}
            </button>
            {isEdit && (
              <button type="button" onClick={resetForm} className=" ring-1 ring-lightGray rounded px-4 py-2" data-testid="af-cancel">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="ring-1 ring-lightGray rounded-md p-4 bg-white" data-testid="address-list">
          <h2 className="text-xl font-semibold mb-3">Saved Addresses ({addresses.length})</h2>
          <div className="grid gap-3">
            {isLoading ? (
              <div className="text-lightGray">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="text-lightGray" data-testid="al-empty">No addresses saved yet.</div>
            ) : null}
            {!isLoading && addresses.map((a) => (
              <div key={a.id} className="ring-1 ring-lightDim rounded p-3 grid sm:grid-cols-6 grid-cols-2 gap-2 items-start" data-testid="al-item">
                <div className="col-span-2">
                  <div className="font-semibold" data-testid="al-name">{a.name}</div>
                  <div className="text-sm text-lightGray break-words" data-testid="al-address">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</div>
                  <div className="text-sm text-lightGray break-words" data-testid="al-city-state">{a.city}{a.state ? `, ${a.state}` : ""}</div>
                  <div className="text-sm text-lightGray break-words" data-testid="al-postal-country">{a.postalCode}, {a.country}</div>
                  {a.phone && <div className="text-sm text-lightGray break-words" data-testid="al-phone">{a.phone}</div>}
                </div>
                <div className="sm:col-span-4 flex gap-2 justify-end">
                  <button className=" ring-1 ring-primary text-primary rounded px-3 py-1" onClick={() => onEdit(a.id)} data-testid="al-edit">Edit</button>
                  <button className=" ring-1 ring-love text-love rounded px-3 py-1" onClick={() => onDelete(a.id)} data-testid="al-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


