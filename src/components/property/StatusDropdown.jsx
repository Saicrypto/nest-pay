import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuCheck } from "react-icons/lu";
import "./StatusDropdown.css";

function StatusDropdown({
  value,
  onChange,
  label,
  options,
  variant = "occupancy",
  disabled = false,
  showDot = true,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={dropdownRef}
      className={`status-dropdown ${variant} ${value} ${open ? "is-open" : ""}`}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="status-dropdown-trigger"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
      >
        {showDot && <span className="status-dropdown-dot" />}
        <span>{currentOption?.label || value}</span>
        <LuChevronDown
          size={14}
          className={open ? "rotated" : ""}
        />
      </button>

      {open && (
        <div
          className="status-dropdown-menu"
          role="listbox"
          aria-label={label}
          onClick={(event) => event.stopPropagation()}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`status-dropdown-option ${option.value} ${
                option.value === value ? "selected" : ""
              }`}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                if (option.value !== value) {
                  onChange(option.value);
                }
              }}
            >
              {showDot && <span className="status-dropdown-dot" />}
              <span>{option.label}</span>
              {option.value === value && <LuCheck size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusDropdown;