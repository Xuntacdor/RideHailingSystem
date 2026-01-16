import React from "react";
import {
  Search,
  CreditCard,
  Gift,
  Star,
  Bell,
  Car,
  Sandwich,
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Expand,
} from "lucide-react";

// Dummy data
const categories = [
  { name: "Transport", icon: Car },
  { name: "Food", icon: Sandwich },
  { name: "Dine Out", icon: Utensils },
  { name: "Mart", icon: ShoppingCart },
  { name: "Shopping", icon: ShoppingBag },
  { name: "All", icon: Expand },
];

const foods = [
  {
    name: "Fresh Milk with Brown Sugar",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    rating: 4.5,
    reviews: 212,
    price: "$7.50",
    oldPrice: "$8.50",
    time: "80 mins",
  },
  {
    name: "Bubble Milk Tea",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    rating: 4.5,
    reviews: 317,
    price: "$5.00",
    oldPrice: "$7.00",
    time: "40 mins",
  },
];
function NotificationBell({ count }) {
  return (
    <div className="relative inline-block">
      <Bell size={24} className="text-gray-500" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full px-1.25 py-1.0">
          {count}
        </span>
      )}
    </div>
  );
}
export default function HomeBookingPage() {
  return (
    <div className="min-h-screen bg-white px-4 pt-2 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Avatar"
          className="w-9 h-9 rounded-full"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none"
            placeholder="Search"
          />
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <button className="text-gray-500 hover:text-blue-500 transition">
          <NotificationBell count={3} /> {/* ví dụ có 3 thông báo */}
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className="flex flex-col items-center justify-center bg-gray-100 rounded-xl py-3 hover:bg-blue-50 transition"
          >
            <cat.icon className="mb-2 text-blue-500" size={32} />
            <span className="text-sm font-semibold text-gray-700">
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Payment & Rewards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
          <CreditCard className="text-blue-500" size={22} />
          <div>
            <div className="text-xs text-gray-500">Payment</div>
            <div className="text-sm font-medium">Add a Card</div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
          <Gift className="text-green-500" size={22} />
          <div>
            <div className="text-xs text-gray-500">Grab Rewards</div>
            <div className="text-sm font-medium">0</div>
          </div>
        </div>
      </div>

      {/* Food For You */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">Food For You</div>
        <button className="text-blue-500 text-xs font-semibold">See All</button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {foods.map((food, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-3 shadow-sm">
            <img
              src={food.img}
              alt={food.name}
              className="w-full h-27.5 object-cover rounded-lg mb-2"
            />
            <div className="font-medium text-sm mb-1">{food.name}</div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Star className="text-yellow-400 mr-1" size={16} />
              {food.rating} ({food.reviews}+ review)
            </div>
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="font-bold text-blue-700">{food.price}</span>
              <span className="line-through text-gray-400">
                {food.oldPrice}
              </span>
              <span>{food.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Snacks */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">Order Snacks From</div>
        <button className="text-blue-500 text-xs font-semibold">See All</button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-24">
        {/* demo 2 ảnh */}
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
              alt="Snack"
              className="w-full h-27.5 object-cover rounded-lg mb-2"
            />
            <div className="font-medium text-sm mb-1">Snack {i}</div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Star className="text-yellow-400 mr-1" size={16} />
              4.5 (100+ review)
            </div>
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="font-bold text-blue-700">\$4.00</span>
              <span className="line-through text-gray-400">\$6.00</span>
              <span>30 mins</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 bg-white border-t flex items-center justify-between z-10">
        <button className="flex flex-col items-center text-green-500 font-semibold">
          <svg width="28" height="28" fill="none">
            <circle
              cx="14"
              cy="14"
              r="12"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="14" cy="14" r="6" fill="currentColor" />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg width="28" height="28" fill="none">
            <rect
              x="6"
              y="6"
              width="16"
              height="16"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="text-xs">Order</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg width="28" height="28" fill="none">
            <path d="M6 14h16" stroke="currentColor" strokeWidth="2" />
            <circle
              cx="14"
              cy="14"
              r="12"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="text-xs">Rewards</span>
        </button>
      </div>
    </div>
  );
}
