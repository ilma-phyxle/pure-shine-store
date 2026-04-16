import { useNavigate } from "react-router-dom";
import React from "react";

interface ProductQuickViewProps {
    handle: string;
    children: React.ReactNode;
}

export const ProductQuickView = ({ handle, children }: ProductQuickViewProps) => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(`/product-quick/${handle}`);
    };

    // Clone the children and add the click handler to avoid button nesting
    return React.cloneElement(children as React.ReactElement, {
        onClick: handleClick,
        className: `${(children as React.ReactElement).props.className || ''} cursor-pointer`.trim(),
    });
};
