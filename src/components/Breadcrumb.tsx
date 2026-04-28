import Link from "next/link";

export type Crumb = { name: string; href?: string };

type Props = {
  items: Crumb[];
};

export default function Breadcrumb({ items }: Props) {
  return (
    <nav
      aria-label="パンくずリスト"
      className="text-[12px] text-[#5a7090]"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className="hover:text-[#0099e6] hover:underline"
                >
                  {c.name}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-[#0a2540] font-bold" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {c.name}
                </span>
              )}
              {!isLast && (
                <svg
                  className="w-3 h-3 text-[#cfdfee]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
