import { useState } from 'react'
import ItemSelector from '../components/ItemSelector.jsx'
import Spinner from '../components/Spinner.jsx'
import { submitRequirement } from '../services/api.js'
import { validateRequirementForm } from '../utils/validators.js'
import '../styles/SubmitRequirement.css'

const INITIAL_FORM = {
  shopName: '',
  item: '',
  customItem: '',
  quantity: '',
}

export default function SubmitRequirement({ onSuccess, showToast }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSelectItem(itemName) {
    setForm((prev) => ({
      ...prev,
      item: itemName,
      customItem: itemName === 'Other' ? prev.customItem : '',
    }))
    setErrors((prev) => ({ ...prev, item: undefined, customItem: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateRequirementForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const finalItem = form.item === 'Other' ? form.customItem.trim() : form.item

    setSubmitting(true)
    try {
      const result = await submitRequirement({
        shopName: form.shopName.trim(),
        item: finalItem,
        quantity: Number(form.quantity),
      })
      showToast(
          result?.message || "Requirement stored successfully.",
          "success"
      )
      setForm(INITIAL_FORM)
      setErrors({})
      if (onSuccess) {
          await onSuccess()
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit requirement.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="submit-page">
      <div className="glass-panel submit-panel">
        <div className="panel-header">
          <h2>Submit a requirement</h2>
          <p>Let us know what your shop needs and we&rsquo;ll add it to the queue.</p>
        </div>

        <form className="submit-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="shopName">Shop name</label>
            <input
              id="shopName"
              type="text"
              placeholder="e.g. Shop A"
              value={form.shopName}
              onChange={(e) => updateField('shopName', e.target.value)}
              className={errors.shopName ? 'input-error' : ''}
              aria-invalid={Boolean(errors.shopName)}
              aria-describedby={errors.shopName ? 'shopName-error' : undefined}
            />
            {errors.shopName && (
              <span className="field-error" id="shopName-error">
                {errors.shopName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label>Item</label>
            <ItemSelector selected={form.item} onSelect={handleSelectItem} />
            {errors.item && <span className="field-error">{errors.item}</span>}
          </div>

          {form.item === 'Other' && (
            <div className="form-field form-field-animate">
              <label htmlFor="customItem">Specify item</label>
              <input
                id="customItem"
                type="text"
                placeholder="Enter item name"
                value={form.customItem}
                onChange={(e) => updateField('customItem', e.target.value)}
                className={errors.customItem ? 'input-error' : ''}
                aria-invalid={Boolean(errors.customItem)}
              />
              {errors.customItem && <span className="field-error">{errors.customItem}</span>}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              placeholder="e.g. 20"
              value={form.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              className={errors.quantity ? 'input-error' : ''}
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={errors.quantity ? 'quantity-error' : undefined}
            />
            {errors.quantity && (
              <span className="field-error" id="quantity-error">
                {errors.quantity}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
            {submitting ? <Spinner size="sm" label="Submitting…" /> : 'Submit requirement'}
          </button>
        </form>
      </div>
    </div>
  )
}
