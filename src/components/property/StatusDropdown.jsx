
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
    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`status-dropdown ${variant} ${value}`}
    >
      <button
        type="button"
        className="status-dropdown-trigger"
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
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
        <div className="status-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`status-dropdown-option ${option.value} ${
                option.value === value ? "selected" : ""
              }`}
              onClick={() => {
                if (option.value !== value) onChange(option.value);
                setOpen(false);
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
