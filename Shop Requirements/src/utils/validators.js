export function validateRequirementForm({ shopName, item, customItem, quantity }) {
  const errors = {}

  if (!shopName || !shopName.trim()) {
    errors.shopName = 'Shop name is required.'
  }

  if (!item) {
    errors.item = 'Please select an item.'
  } else if (item === 'Other' && (!customItem || !customItem.trim())) {
    errors.customItem = 'Please enter the item name.'
  }

  const quantityNum = Number(quantity)
  if (quantity === '' || quantity === null || quantity === undefined) {
    errors.quantity = 'Quantity is required.'
  } else if (Number.isNaN(quantityNum) || quantityNum <= 0) {
    errors.quantity = 'Quantity must be greater than 0.'
  }

  return errors
}
