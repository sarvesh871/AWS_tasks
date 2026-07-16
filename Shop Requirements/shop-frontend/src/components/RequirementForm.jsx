import { useState } from "react";
import { GOOGLE_FORM, ITEMS } from "../config/googleForm";

function RequirementForm() {
  const [shopName, setShopName] = useState("");
  const [item, setItem] = useState("");
  const [otherItem, setOtherItem] = useState("");
  const [quantity, setQuantity] = useState("");

  return (
    <div className="container">
      <h2>Shop Requirements</h2>

        <p className="subtitle">
            Submit inventory requirements for your shop
        </p>

      <form>
        {/* Shop Name */}
        <div className="form-group">
          <label>Shop Name</label>

          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Enter shop name"
            required
          />
        </div>

        {/* Item */}

        <div className="form-group">
          <label>Item</label>
          <div className="radio-grid">
            {ITEMS.map((currentItem) => (
                <div key={currentItem} className="radio-card">
                    <input
                        type="radio"
                        value={currentItem}
                        checked={item === currentItem}
                        onChange={(e) => setItem(e.target.value)}
                    />
                    <span>{currentItem}</span>
                </div>
            ))}
            </div>
        </div>

        {/* Other Item */}

        {item === "Other" && (
          <div className="form-group">
            <label>Specify Item</label>

            <input
              type="text"
              value={otherItem}
              onChange={(e) => setOtherItem(e.target.value)}
              placeholder="Enter item name"
              required
            />
          </div>
        )}

        {/* Quantity */}

        <div className="form-group">
          <label>Quantity</label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            required
          />
        </div>

        <button type="submit">
          Submit Requirement
        </button>
      </form>
    </div>
  );
}

export default RequirementForm;