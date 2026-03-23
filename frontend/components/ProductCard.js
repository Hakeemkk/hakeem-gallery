import React from 'react';

const ProductCard = ({ product, onAddToCart, onBuyNow }) => {
  return (
    <div className="card">
      <div className="card-img">
        <img src={product.img} alt={product.title} />
        {product.tier2Qty && <div className="tag-wholesale">خصم جملة 🔥</div>}
      </div>
      <div className="card-info">
        <h3>{product.title}</h3>
        <div className="card-price">{product.price} ج.م</div>
        <div className="card-btns">
          <button className="btn-cart" onClick={() => onAddToCart(product)}>
            السلة 🛒
          </button>
          <button className="btn-buy" onClick={() => onBuyNow(product)}>
            شراء ⚡
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
