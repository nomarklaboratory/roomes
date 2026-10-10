"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  catalog,
  products,
  presets,
  finishes,
  durations,
  money,
  type Category,
  type Product,
} from "@/lib/catalog";
import {
  baliToday,
  canAdd,
  decodeSaved,
  initialHistory,
  quote,
  reducer,
  STORAGE_KEY,
  validDeliveryDate,
  type Action,
} from "@/lib/workspace";
import { RoomPreview } from "./room-preview";
import type { CameraView } from "@/types/viewer";
import { Icon } from "./icon";
import { PlacementControls } from "./placement-controls";

type Step = "design" | "review" | "done";
function PresetArt({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 90 72" aria-hidden="true">
      <path
        fill={["#e0d6ba", "#b8c7a7", "#d6b69b"][index]}
        d="M10 42V9l37-5 33 16v28L43 63z"
      />
      <path fill="#ece4d2" d="m10 42 33-18 37 24-37 19z" />
      <path
        fill={["#c6a780", "#b99973", "#82553d"][index]}
        d="m24 35 24-12 24 11-24 13z"
      />
      <path stroke="#767e6a" strokeWidth="3" d="M27 38v15m40-15v14" />
      {index > 0 && <path fill="#344d3e" d="m43 19 16 6v12l-16-6z" />}
      <path
        fill={index === 1 ? "#485743" : "#8c9c7e"}
        d="M40 40q-6-12 4-14 12 3 7 17l-11 5z"
      />
      <path stroke="#54624d" strokeWidth="2" d="m44 45 1 12-7 3m7-3 9 3" />
      <path fill="#bfd2c9" d="m14 14 14-3v17l-14 6z" />
      {index === 2 && (
        <path fill="#5f7851" d="M66 31v-6l-5-4 2-3 5 4 3-5 3 3-5 6v7z" />
      )}
    </svg>
  );
}
function ProductPhoto({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  return (
    <div className={`product-photo ${compact ? "compact" : ""}`}>
      <Image
        src={`/thumbnails/${product.id}.png?v=${product.assetVersion ?? 1}`}
        alt=""
        width={480}
        height={360}
        sizes={compact ? "90px" : "240px"}
      />
    </div>
  );
}
export default function Studio() {
  const [history, dispatch] = useReducer(reducer, undefined, initialHistory);
  const setup = history.present;
  const rental = quote(setup);
  const [category, setCategory] = useState<Category>("desk");
  const [view, setView] = useState<CameraView>("room");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("design");
  const [loaded, setLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [help, setHelp] = useState(false);
  const helpRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [futureMinimum, setFutureMinimum] = useState("");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [formError, setFormError] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = decodeSaved(localStorage.getItem(STORAGE_KEY));
        if (saved) dispatch({ type: "hydrate", setup: saved });
      } catch {
        setStorageWarning(true);
      }
      setLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 1, setup }),
        );
      } catch {
        queueMicrotask(() => setStorageWarning(true));
      }
    }
  }, [setup, loaded]);
  useEffect(() => {
    if (help) helpRef.current?.showModal();
    else helpRef.current?.close();
  }, [help]);
  const change = (action: Action) => {
    dispatch(action);
  };
  const go = (next: Step) => {
    if (next === "review") {
      const tomorrow = new Date(`${baliToday()}T00:00:00Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      setFutureMinimum(tomorrow.toISOString().slice(0, 10));
    }
    setStep(next);
    setSelected(null);
    setFormError("");
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  };
  const selectInScene = (id: string) => {
    if (step !== "design") return;
    if (id === "desk" || id === "chair") {
      setCategory(id);
    } else {
      setCategory("accessory");
    }
    setSelected(id);
  };
  const confirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!validDeliveryDate(date)) {
      setFormError("Choose a future date in Bali (UTC+8).");
      return;
    }
    go("done");
    setName("");
    setArea("");
    setDate("");
  };
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link
          href="/"
          className="brand"
          aria-label="monis.rent workspace studio"
        >
          monis<span className="brand-dot">.</span>
          <span className="brand-rent">rent</span>
        </Link>
        <div className="header-center">
          <span className="tiny-dot" /> WORKSPACE STUDIO
        </div>
        <button className="text-button" onClick={() => setHelp(true)}>
          How it works <Icon name="info" size={17} />
        </button>
      </header>
      <main>
        <div className="hero-row">
          <div>
            <div className="eyebrow">
              <span className="bali-tag">
                <Icon name="sun" size={14} /> MADE FOR YOUR BALI CHAPTER
              </span>
            </div>
            <h1 ref={headingRef} tabIndex={-1}>
              {step === "design" ? (
                <>
                  Find your <em>flow.</em>
                </>
              ) : step === "review" ? (
                <>
                  Looks like <em>you.</em>
                </>
              ) : (
                <>
                  You’re all <em>set.</em>
                </>
              )}
            </h1>
            <p className="hero-copy">
              {step === "design"
                ? "A good workspace changes everything. Let’s make yours."
                : step === "review"
                  ? "One last look at your little corner of possibility."
                  : "Your dream workspace, brought together. Nice work."}
            </p>
          </div>
          <nav className="steps" aria-label="Design progress">
            {(["design", "review", "done"] as Step[]).map((s, i) => (
              <span
                key={s}
                className={`step ${step === s ? "current" : ""}`}
                aria-current={step === s ? "step" : undefined}
              >
                <b>
                  {s === "design" && step !== "design" ? (
                    <Icon name="check" size={14} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </b>
                {["Design", "Review", "Ready"][i]}
              </span>
            ))}
          </nav>
        </div>
        <div className="studio-layout">
          <section className="visual-column" aria-label="Your workspace">
            {step === "design" && (
              <div className="preset-section">
                <div className="section-label">
                  START WITH A FEELING <span>Then make it your own</span>
                </div>
                <div className="presets">
                  {presets.map((preset, i) => (
                    <button
                      key={preset.id}
                      className={`preset ${setup.presetId === preset.id ? "active" : ""}`}
                      aria-pressed={setup.presetId === preset.id}
                      onClick={() => {
                        change({ type: "preset", id: preset.id });
                        setSelected(null);
                      }}
                    >
                      <PresetArt index={i} />
                      <span>
                        <strong>{preset.name}</strong>
                        <small>{preset.description}</small>
                      </span>
                      <span className="preset-check">
                        {setup.presetId === preset.id ? (
                          <Icon name="check" size={12} />
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div
              className={`preview-stage ${view === "walk" ? "walking-stage" : ""} ${previewExpanded ? "fixed! inset-0 z-[100] h-dvh! w-screen! max-w-none! rounded-none! border-0!" : ""}`}
            >
              <div className="stage-top">
                <span className="scene-label">
                  <span className="tiny-dot" />{" "}
                  {presets
                    .find((p) => p.id === setup.presetId)!
                    .name.toUpperCase()}
                  <small> / YOUR SPACE</small>
                </span>
                <div className="camera-options" aria-label="Camera angle">
                  {(["room", "front", "top"] as CameraView[]).map((v) => (
                    <button
                      key={v}
                      aria-pressed={view === v}
                      onClick={() => setView(v)}
                    >
                      {v[0].toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                  <button
                    className="inside-button"
                    aria-label="First-person view"
                    aria-pressed={view === "walk"}
                    onClick={() => {
                      setView("walk");
                      setSelected(null);
                    }}
                  >
                    <Icon name="eye" size={13} /> Inside
                  </button>
                </div>
              </div>
              <div
                className={`scene-container ${previewExpanded ? "inset-0!" : ""}`}
              >
                <RoomPreview
                  setup={setup}
                  view={view}
                  onSelect={selectInScene}
                  selected={selected}
                  editable={step === "design"}
                  onMove={(id, position) =>
                    change({ type: "place", id, position })
                  }
                  onExitWalk={() => setView("room")}
                  previewExpanded={previewExpanded}
                  onPreviewExpandedChange={setPreviewExpanded}
                />
              </div>
              <div className="stage-bottom">
                <span>
                  <Icon name="move" size={15} />{" "}
                  {step === "design"
                    ? "Drag items to move · Empty space to orbit"
                    : "Drag to explore · Scroll to zoom"}
                </span>
                <span className="preview-note">STYLIZED 3D PREVIEW</span>
              </div>
              <span className="room-dimension">BALI, IN A LITTLE ROOM.</span>
            </div>
            {step === "design" && (
              <div className="setup-strip">
                <span className="strip-label">IN YOUR SETUP</span>
                <div className="item-chips">
                  <button
                    aria-pressed={selected === "desk"}
                    onClick={() => {
                      setCategory("desk");
                      setSelected(selected === "desk" ? null : "desk");
                    }}
                  >
                    <Icon name="desk" size={14} />
                    Desk
                  </button>
                  <button
                    aria-pressed={selected === "chair"}
                    onClick={() => {
                      setCategory("chair");
                      setSelected(selected === "chair" ? null : "chair");
                    }}
                  >
                    <Icon name="chair" size={14} />
                    Chair
                  </button>
                  {setup.items.map((item) => (
                    <button
                      key={item.id}
                      aria-pressed={selected === item.id}
                      onClick={() => {
                        setCategory("accessory");
                        setSelected(selected === item.id ? null : item.id);
                      }}
                    >
                      {catalog[item.productId].kind === "monitor" ? (
                        <Icon name="monitor" size={14} />
                      ) : (
                        <Icon
                          name={
                            catalog[item.productId].kind === "plant"
                              ? "leaf"
                              : "extras"
                          }
                          size={14}
                        />
                      )}{" "}
                      {catalog[item.productId].name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === "design" && selected && view !== "walk" && (
              <PlacementControls
                setup={setup}
                selected={selected}
                onChange={change}
                onClose={() => setSelected(null)}
              />
            )}
            <div className="below-scene">
              <span>
                <Icon name="leaf" size={16} /> More living. Less owning.
              </span>
              <span>Product-inspired models · Dimensions are illustrative</span>
            </div>
          </section>
          {step === "design" ? (
            <aside
              className="product-panel"
              aria-label="Personalize your workspace"
            >
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">THE GOOD STUFF</div>
                  <h2>Make it yours.</h2>
                </div>
                <span className="item-count">{rental.count} items</span>
              </div>
              <div className="category-tabs" aria-label="Product categories">
                {(["desk", "chair", "accessory"] as Category[]).map((c, i) => (
                  <button
                    key={c}
                    aria-pressed={category === c}
                    onClick={() => {
                      setCategory(c);
                      setSelected(null);
                    }}
                  >
                    <Icon name={c === "accessory" ? "extras" : c} size={17} />
                    {["Desks", "Chairs", "Extras"][i]}
                  </button>
                ))}
              </div>
              <div className="catalog-scroll">
                <p className="category-copy">
                  {category === "desk"
                    ? "Big ideas need a good foundation."
                    : category === "chair"
                      ? "Get comfortable. Stay a while."
                      : "Little things. A big difference."}
                </p>
                <div
                  className={`product-list ${category === "accessory" ? "extras-list" : ""}`}
                >
                  {products
                    .filter((p) => p.category === category)
                    .map((p) => {
                      const active =
                        setup.deskId === p.id || setup.chairId === p.id;
                      const added = setup.items.filter(
                        (i) => i.productId === p.id,
                      );
                      const available = canAdd(setup, p.id);
                      if (category !== "accessory")
                        return (
                          <button
                            key={p.id}
                            className={`product-card ${active ? "active" : ""}`}
                            aria-label={`Select ${p.name}`}
                            aria-pressed={active}
                            onClick={() => change({ type: category, id: p.id })}
                          >
                            <ProductPhoto product={p} />
                            <div className="product-description">
                              <span className="product-title">
                                {p.name}{" "}
                                {p.concept && (
                                  <small className="concept">CONCEPT</small>
                                )}
                              </span>
                              <span className="product-subtitle">
                                {p.subtitle}
                              </span>
                              <span className="product-price">
                                {money(p.weeklyCents)}
                                <small> / week</small>
                              </span>
                            </div>
                            <span className="product-check">
                              {active ? <Icon name="check" size={13} /> : null}
                            </span>
                          </button>
                        );
                      return (
                        <div
                          key={p.id}
                          className={`extra-card ${added.length ? "added" : ""}`}
                        >
                          <ProductPhoto product={p} compact />
                          <div className="extra-description">
                            <strong>
                              {p.name}
                              {p.concept && (
                                <small className="concept">CONCEPT</small>
                              )}
                            </strong>
                            <span>
                              {money(p.weeklyCents)}
                              <small> / week</small>
                            </span>
                            {!available &&
                              !added.length &&
                              p.kind === "monitor" && (
                                <small className="fit-note">
                                  Choose a wider desk to add
                                </small>
                              )}
                          </div>
                          <div className="quantity-controls">
                            {added.length > 0 && (
                              <>
                                <button
                                  className="icon-button"
                                  aria-label={`Remove one ${p.name}`}
                                  onClick={() =>
                                    change({
                                      type: "remove",
                                      id: added.at(-1)!.id,
                                    })
                                  }
                                >
                                  <Icon name="minus" size={14} />
                                </button>
                                <span aria-label={`${added.length} added`}>
                                  {added.length}
                                </span>
                              </>
                            )}
                            <button
                              className="icon-button add-button"
                              disabled={!available}
                              aria-label={`Add ${p.name}`}
                              onClick={() =>
                                change({
                                  type: "add",
                                  productId: p.id,
                                  id: crypto.randomUUID(),
                                })
                              }
                            >
                              <Icon name="plus" size={17} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {category === "desk" && (
                  <div className="finish-section">
                    <div className="section-label">
                      A FINISH THAT FEELS RIGHT
                    </div>
                    <div className="finish-options">
                      {finishes.map((f) => (
                        <button
                          key={f.id}
                          className={setup.finish === f.id ? "active" : ""}
                          onClick={() =>
                            change({ type: "finish", value: f.id })
                          }
                          aria-pressed={setup.finish === f.id}
                        >
                          <span style={{ background: f.color }}>
                            {setup.finish === f.id && (
                              <Icon name="check" size={13} />
                            )}
                          </span>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {category === "accessory" && (
                  <p className="small-note">
                    Up to 2 monitors that fit your desk, and one of each extra.
                    Tap an item below the room to reposition it.
                  </p>
                )}
              </div>
              <div className="panel-footer">
                <button
                  className="text-button"
                  disabled={!history.past.length}
                  onClick={() => {
                    change({ type: "undo" });
                    setSelected(null);
                  }}
                >
                  <Icon name="undo" size={15} />
                  Undo
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    change({ type: "reset" });
                    setSelected(null);
                  }}
                >
                  <Icon name="reset" size={15} />
                  Reset setup
                </button>
              </div>
            </aside>
          ) : step === "review" ? (
            <aside className="review-panel" aria-label="Rental summary">
              <div className="eyebrow">YOUR LITTLE CORNER</div>
              <h2>A good setup.</h2>
              <p className="review-intro">
                {setup.weeks} weeks of making things happen.
              </p>
              <div className="review-lines">
                {rental.lines.map((line) => (
                  <div key={line.product.id}>
                    <Image
                      src={`/thumbnails/${line.product.id}.png?v=${line.product.assetVersion ?? 1}`}
                      width={64}
                      height={48}
                      alt=""
                    />
                    <span>
                      <strong>
                        {line.product.name}
                        {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                      </strong>
                      <small>
                        {line.product.concept
                          ? "Concept product"
                          : "Product-inspired preview"}
                      </small>
                    </span>
                    <b>
                      {money(line.weeklyCents)}
                      <small>/wk</small>
                    </b>
                  </div>
                ))}
              </div>
              <div className="review-total">
                <span>
                  Total for {setup.weeks} weeks
                  <small>{money(rental.weeklyCents)} / week · USD</small>
                </span>
                <strong>{money(rental.totalCents)}</strong>
              </div>
              <p className="demo-label">
                <Icon name="info" size={15} />
                Demo prices. No payment or reservation.
              </p>
              <form onSubmit={confirm} className="checkout-form">
                <h3>Where would it feel like home?</h3>
                <label>
                  Your name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    maxLength={80}
                    placeholder="Alex"
                    required
                  />
                </label>
                <div className="form-row">
                  <label>
                    Bali area
                    <select
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    >
                      <option value="">Choose area</option>
                      {[
                        "Canggu",
                        "Ubud",
                        "Seminyak",
                        "Uluwatu",
                        "Sanur",
                        "Denpasar",
                        "Other Bali area",
                      ].map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Preferred date
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={futureMinimum}
                      required
                      aria-describedby={formError ? "form-error" : undefined}
                    />
                  </label>
                </div>
                {formError && (
                  <p role="alert" id="form-error" className="form-error">
                    {formError}
                  </p>
                )}
                <button className="primary-button" type="submit">
                  Rent this setup <Icon name="arrow" />
                </button>
                <p className="privacy-note">
                  A simulated request. Your details stay in this tab and are
                  cleared after confirmation.
                </p>
              </form>
              <button
                className="text-button back-design"
                onClick={() => go("design")}
              >
                <Icon name="back" size={16} />
                Back to designing
              </button>
            </aside>
          ) : (
            <aside className="confirmation-panel">
              <div className="confirmation-icon">
                <Icon name="check" size={34} />
              </div>
              <div className="eyebrow">GREAT SPACE. GOOD DAYS.</div>
              <h2>
                Your next chapter
                <br />
                looks good.
              </h2>
              <p>
                You’ve put together {rental.count} items for {setup.weeks}{" "}
                weeks. Your workspace is{" "}
                {storageWarning
                  ? "available in this tab"
                  : "saved on this device"}
                .
              </p>
              <div className="receipt-total">
                <span>Your demo setup</span>
                <strong>{money(rental.totalCents)}</strong>
                <small>
                  {money(rental.weeklyCents)} / week · {setup.weeks} weeks
                </small>
              </div>
              <div className="demo-confirmation">
                <Icon name="info" size={19} />
                <p>
                  This is a demo confirmation. No booking was sent, no stock
                  reserved, and no payment taken.
                </p>
              </div>
              <button className="primary-button" onClick={() => go("design")}>
                Keep designing <Icon name="arrow" />
              </button>
              <a
                className="text-button visit-monis"
                href="https://www.monis.rent/"
                target="_blank"
                rel="noreferrer"
              >
                Explore real rentals at monis.rent{" "}
                <Icon name="arrow" size={15} />
              </a>
            </aside>
          )}
        </div>
        {step === "design" && (
          <div className="rental-bar">
            <div className="duration-control">
              <span className="section-label">HOW LONG IS YOUR CHAPTER?</span>
              <div className="duration-options" aria-label="Rental duration">
                {durations.map((weeks) => (
                  <button
                    key={weeks}
                    aria-pressed={setup.weeks === weeks}
                    onClick={() => change({ type: "weeks", value: weeks })}
                  >
                    {weeks} {weeks === 1 ? "week" : "weeks"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rental-price">
              <span>
                {money(rental.totalCents)}
                <small> / {setup.weeks} weeks</small>
              </span>
              <small>
                {money(rental.weeklyCents)} per week · USD · Demo prices
              </small>
            </div>
            <button className="primary-button" onClick={() => go("review")}>
              Review my setup <Icon name="arrow" />
            </button>
          </div>
        )}
        <div className="status-row">
          <span role="status" aria-live="polite">
            {history.notice}
          </span>
          <span>
            {storageWarning
              ? "Device storage unavailable. Changes will last for this tab."
              : loaded
                ? "Your setup saves as you go"
                : "Loading your workspace…"}
          </span>
        </div>
      </main>
      <footer className="site-footer">
        <span>A little space to do great things.</span>
        <div>
          <span>Built for Bali</span>
          <span className="footer-dot">·</span>
          <span>Challenge concept for monis.rent</span>
        </div>
      </footer>
      <dialog
        ref={helpRef}
        className="help-dialog"
        onCancel={() => setHelp(false)}
        onClose={() => setHelp(false)}
        aria-labelledby="help-title"
      >
        <button
          className="icon-button dialog-close"
          aria-label="Close how it works"
          onClick={() => setHelp(false)}
        >
          <Icon name="close" />
        </button>
        <div className="eyebrow">IT STARTS WITH YOUR SPACE</div>
        <h2 id="help-title">
          Work from somewhere
          <br />
          that feels like you.
        </h2>
        <ol>
          <li>
            <b>01</b>
            <span>
              <strong>Pick your starting point</strong>Choose a room that
              matches your mood.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Make it your own</strong>Swap the furniture, add little
              extras, and drag items into place. Zoom or go fullscreen for a
              closer look. Choose Inside to explore at a 170 cm person&apos;s
              eye level, then Sit in chair to try the seated view.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Take a closer look</strong>Review your setup and try the
              simulated rental flow.
            </span>
          </li>
        </ol>
        <p className="small-note">
          This challenge demo uses illustrative USD prices and original stylized
          models. Concept products are labeled. The real monis.rent team can
          confirm availability, colors, delivery, and rental rates.
        </p>
        <button className="primary-button" onClick={() => setHelp(false)}>
          Let’s make some space <Icon name="arrow" />
        </button>
      </dialog>
    </div>
  );
}
