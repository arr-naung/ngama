interface XLogoProps {
    className?: string;
    size?: number;
}

export function XLogo({ className = "text-white", size = 24 }: XLogoProps) {
    return (
        <span
            className={`${className} font-bold flex items-center justify-center`}
            style={{ fontSize: size, lineHeight: 1, width: size, height: size }}
        >
            𝔸
        </span>
    );
}
