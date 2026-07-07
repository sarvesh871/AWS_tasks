import "../styles/ConfirmModal.css";

function ConfirmModal({

    open,

    title,

    description,

    confirmText,

    cancelText,

    danger = false,

    onConfirm,

    onCancel

}) {

    if (!open) return null;

    return (

        <div
            className="confirm-modal__overlay"
            onClick={onCancel}
        >

            <div
                className="confirm-modal"
                onClick={(e)=>e.stopPropagation()}
            >

                <h2>{title}</h2>

                <p>{description}</p>

                <div className="confirm-modal__buttons">

                    <button
                        className="confirm-modal__cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        className={
                            danger
                            ? "confirm-modal__danger"
                            : "confirm-modal__confirm"
                        }
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>

            </div>

        </div>

    );

}

export default ConfirmModal;