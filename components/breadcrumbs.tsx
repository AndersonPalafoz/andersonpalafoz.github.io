import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      <Link href="/" className="text-red-500 hover:underline">
        Início
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-gray-500">/</span>
          {index === items.length - 1 ? (
            <span className="text-gray-400">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-red-500 hover:underline">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
