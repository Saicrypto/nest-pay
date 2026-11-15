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

export default function ProviderCard({
  provider,
  type,
  isCustom = false,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const name = isCustom
    ? provider.contact_name
    : type === "utility"
      ? provider.utility_name
      : provider.service_name;

  useEffect(() => {
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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <article className="tenant-provider-card">
      <div className={`tp-card-badge ${type === "utility" ? "utility" : "service"}`}>
        {type === "utility" ? <LuDroplet size={18} /> : <LuWrench size={18} />}
      </div>

      <div className="tenant-provider-info">
        <h3>{name}</h3>

        {provider.contact_person && (
          <p className="tp-card-person">
            <LuUserRound size={12} />
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
        {provider.phone && (
          <a
            className="tenant-provider-call"
            href={`tel:${provider.phone}`}
            aria-label={`Call ${name}`}
          >
            <LuPhone size={14} />
            <span>Call</span>
          </a>
        )}

        {isCustom && (
          <div className="tenant-provider-menu" ref={menuRef}>
            <button
              type="button"
              className="tenant-provider-menu-trigger"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Contact options"
              aria-expanded={menuOpen}
            >
              <LuEllipsisVertical size={17} />
            </button>

            {menuOpen && (
              <div className="tenant-provider-dropdown" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(provider);
                  }}
                >
                  <LuPencil size={14} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="delete-option"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(provider);
                  }}
                >
                  <LuTrash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}