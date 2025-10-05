import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GroupSearchBar({ allGroups }) {
    const [query, setQuery] = useState("")
    const [filteredGroups, setFilteredGroups] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
     const navigate = useNavigate()

    useEffect(() => {
        if (query.trim().length > 0) {
            const filtered = allGroups.filter((g) =>
            g.name.toLowerCase().includes(query.toLowerCase())
        )
            setFilteredGroups(filtered)
            setShowDropdown(true)

        }   else {
                setFilteredGroups([])
                setShowDropdown(false)
            }
    },  [query, allGroups])

    const handleSelectGroup = (group) => {
        navigate(`/groups/${group.groupid}`);
        setQuery("");
        setShowDropdown(false);
    }

    return (
        <div className="mb-5 position-relative">
            <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
                <input
                    className="form-control"
                    type="search"
                    placeholder="Etsi ryhmiä"
                    aria-label="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>

            {showDropdown && filteredGroups.length > 0 && (
                <ul className="list-group search-list-group position-absolute w-100">
                    {filteredGroups.map((group) => (
                        <li
                            key={group.groupid}
                            className="list-group-item search-list-group-item list-group-item-action"
                            onClick={() => {
                            handleSelectGroup(group)
                            setQuery("")
                            setShowDropdown(false)
                            }}
                        >
                          {group.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
