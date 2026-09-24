export default function CatalogStatus({catalog}) {
  if (catalog.status === "ready") return null;
  return <p role="status" data-catalog-state={catalog.status}>
    {catalog.status === "loading" ? "Loading project evidence…" : catalog.status === "empty" ? "No projects are published here yet." : <>Project evidence is temporarily unavailable. <button type="button" onClick={catalog.retry}>Try again</button></>}
  </p>;
}
