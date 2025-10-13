import React from "react";
import { Link } from "react-router-dom";
import "./style/GroupCard.css"

export default function GroupCard({ group }) {
    return (
        <div className="card group-card card-bg">
            <Link to={`/groups/${group.groupid}`} className="text-decoration-none text-dark">
                <img
                    src={
                      group.groupimg
                        ? group.groupimg
                        : "https://placehold.co/300x200?text=Ryhmä"
                    }

                  className="card-img-top"
                  alt={group.name}
                />
                <div className="card-body">
                    <h5>{group.name}</h5>
                    <p className="card-text">{group.description?.slice(0, 120)}...</p>
                </div>
            </Link>
        </div>
    )
}
