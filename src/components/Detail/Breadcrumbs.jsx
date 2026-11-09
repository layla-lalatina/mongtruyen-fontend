import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ links, current }) => (
  <div className="mb-6 text-sm text-emerald-800 flex flex-wrap items-center gap-1 font-medium">
    {links.filter(link => link.to).map((link, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span className="text-emerald-300 mx-1">/</span>}
        <Link to={link.to} className="hover:underline text-emerald-700 hover:text-emerald-500 transition-colors">
          {link.label}
        </Link>
      </React.Fragment>
    ))}
    {current && (
      <>
        <span className="text-emerald-300 mx-1">/</span>
        <span className="font-bold text-emerald-950 bg-emerald-100/60 px-2.5 py-0.5 rounded-lg border border-emerald-200/50 truncate max-w-[280px] sm:max-w-md" title={current}>
          {current}
        </span>
      </>
    )}
  </div>
);

export default Breadcrumbs;