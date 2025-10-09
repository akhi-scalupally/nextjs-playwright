"use client";
import { useEffect, useState } from "react";
import type { BannerDataTypes, ProductsTypes } from "../app/page";
import FooterBanner from "../comps/FooterBanner";
import MainBanner from "./MainBanner";
import Products from "../app/Products";

interface HomeProps {
  products: ProductsTypes[];
  bannerData: BannerDataTypes[];
}

const getNumericPrice = (p: any): number =>
  typeof p?.price === "number" ? p.price 
   : 0;

function sortArray(arr: any[], order: "asc" | "desc" = "asc") {
  return arr.sort((a, b) => {
    const av = getNumericPrice(a);
    const bv = getNumericPrice(b);
    if (order === "asc") return av - bv;
    if (order === "desc") return bv - av;
    throw new Error("Invalid order. Use 'asc' or 'desc'.");
  });
}

const Home = ({ products, bannerData }: HomeProps) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [jpyRate, setJpyRate] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (mounted) setJpyRate(data?.rates?.JPY ?? null);
      } catch (e) {
        console.error("Failed to fetch FX rate:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const sortedProducts = sortArray([...products], sortOrder);

  return (
    <main>
      {/* === MAIN BANNER  */}
      <MainBanner banner={bannerData[0]} />

      <section className="  mb-4 flex items-center flex-col sm:flex-row sm:justify-between sm:mx-8 lg:mx-20 w-auto">
        <h1
          className=" headTitle px-8 py-4 sm:py-2 sm:text-4xl text-2xl text-secondary
         font-sans font-extrabold sm:rounded-t-3xl"
        >
          Best Selling Headphones
        </h1>
        <div className=" px-4 w-full sm:w-auto">
          <label htmlFor="price-sort" className="sr-only">
            Sort by price
          </label>
          <select
            id="price-sort"
            className=" ring-1 ring-lightGray rounded-md px-3 py-2 text-sm text-secondary bg-white w-full sm:w-48"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          >
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        </div>
      </section>

      {/* === SHOW PRODUCTS  */}
      <section
        className=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3
       lg:mx-20 overflow-hidden
      "
      >
        {/* === MAP PRODUCTS  */}
        {sortedProducts?.map((p: ProductsTypes) => {
          return <Products key={p._id} products={p} jpyRate={jpyRate} />;
        })}
      </section>

      {/* ==== FOOTER BANNER  */}
      <FooterBanner bannerData={bannerData && bannerData[1]} />
    </main>
  );
};

export default Home;