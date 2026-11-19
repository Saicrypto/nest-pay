import { useState, useEffect, useRef } from "react";
import {
  LuWrench,
  LuDroplet,
  LuPhone,
  LuUserRound,
  LuEllipsisVertical,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";

function sanitizeTelHref(phone) {
  const cleaned = String(phone ?? "").replace(/[^\d+]/g, "");
  return cleaned.length >= 3 ? `tel:${cleaned}` : null;
}

export default function ProviderCard({
  provider,
  type,
  isCustom = false,
  deleting = false,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  if (!provider) return null;

  const name =
    (isCustom
      ? provider.contact_name
      : type === "utility"
        ? provider.utility_name
        : provider.service_name) || "Unnamed contact";

  const telHref = sanitizeTelHref(provider.phone);

  return (
    <article className="tenant-provider-card">
      <div
        className={`tp-card-badge ${type === "utility" ? "utility" : "service"}`}
      >
        {type === "utility" ? (
          <LuDroplet size={18} aria-hidden="true" />
        ) : (
          <LuWrench size={18} aria-hidden="true" />
        )}
      </div>

      <div className="tenant-provider-info">
        <h3>{name}</h3>

        {provider.contact_person && (
          <p className="tp-card-person">
            <LuUserRound size={12} aria-hidden="true" />
            <span>{provider.contact_person}</span>
          </p>
        )}

        {provider.description && (
          <p className="tp-card-desc">{provider.description}</p>
        )}

        {provider.phone && (
          <p className="tp-card-phone">{provider.phone}</p>
        )}
      </div>

      <div className="tenant-provider-actions">
        {telHref && (
          <a
            className="tenant-provider-call"
            href={telHref}
            aria-label={`Call ${name}`}
          >
            <LuPhone size={14} aria-hidden="true" />
            <span>Call</span>
          </a>
        )}

        {isCustom && (
          <div className="tenant-provider-menu" ref={menuRef}>
            <button
              type="button"
              className="tenant-provider-menu-trigger"
              onClick={() => setMenuOpen((prev) => !prev)}
              disabled={deleting}
              aria-label={`Options for ${name}`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <LuEllipsisVertical size={17} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className="tenant-provider-dropdown" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  disabled={deleting}
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(provider);
                  }}
                >
                  <LuPencil size={14} aria-hidden="true" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="delete-option"
                  disabled={deleting}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(provider);
                  }}
                >
                  <LuTrash2 size={14} aria-hidden="true" />
                  <span>{deleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}