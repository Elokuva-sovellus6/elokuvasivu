import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/Dropdown.css"

/**
 * GenericDropdown component
 *
 * @param {string} label - Teksti joka näkyy oletuksena (esim. "Valitse alue")
 * @param {Array} items - Lista vaihtoehdoista (array of objects)
 * @param {string|number} selected - Tällä hetkellä valittu id
 * @param {function} onSelect - Funktio joka saa parametriksi id:n kun käyttäjä valitsee
 * @param {string} itemKey - Avain objektista, jota käytetään id:nä (esim. "id")
 * @param {string} itemLabel - Avain objektista, jota näytetään käyttäjälle (esim. "name")
 */
export default function GenericDropdown({
  label = "Select option",
  items = [],
  selected = "",
  onSelect,
  itemKey = "id",
  itemLabel = "name",
}) {
  const selectedName =
    items.find((item) => item[itemKey] === selected)?.[itemLabel] || label;

  return (
    <div className="dropdown my-3">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {selectedName}
      </button>
      <ul className="dropdown-menu">
        <li>
          <button className="dropdown-item" onClick={() => onSelect("")}>
            {label}
          </button>
        </li>
        {items.map((item) => (
          <li key={item[itemKey]}>
            <button
              className={`dropdown-item ${
                selected === item[itemKey] ? "active" : ""
              }`}
              onClick={() => onSelect(item[itemKey])}
            >
              {item[itemLabel]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}