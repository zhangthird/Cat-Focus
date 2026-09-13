import React from "react";
import {
  Check,
  LoaderCircle,
  Lock,
  Save,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { translations } from "./data/translations";
import { themes } from "./data/themes";
import { catalog, catMessages } from "./data/catalog";
import { Artwork } from "./components/Artwork";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { localDay } from "./utils/date";
import ApiSettings from "./components/ApiSettings";
import { requestCoach } from "./utils/llm";
export default function App() {
  const [apiConfig, setApiConfig] = React.useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('catFocus_api') || '{}'); return { enabled: saved.enabled === true, baseUrl: typeof saved.baseUrl === 'string' ? saved.baseUrl : '', model: typeof saved.model === 'string' ? saved.model : '', apiKey: typeof saved.apiKey === 'string' ? saved.apiKey : '' }; }
    catch { return { enabled: false, baseUrl: '', model: '', apiKey: '' }; }
  });
  const [rememberKey, setRememberKey] = React.useState(() => Boolean(apiConfig.apiKey));
  const coachRequest = React.useRef(null);
  React.useEffect(() => {
    try { localStorage.setItem('catFocus_api', JSON.stringify({ ...apiConfig, apiKey: rememberKey ? apiConfig.apiKey : '' })); }
    catch { setToast('无法保存 API 设置 / Could not save API settings'); }
  }, [apiConfig, rememberKey]);
  React.useEffect(() => () => coachRequest.current?.abort(), []);
  const [language, setLanguage] = useLocalStorage("catFocus_lang", "zh");
  const text = translations[language];
  const [duration, setDuration] = useLocalStorage("catFocus_initialTime", 25);
  const [remaining, setRemaining] = React.useState(1500);
  const [running, setRunning] = React.useState(false);
  const [themeId, setThemeId] = useLocalStorage("catFocus_theme", "dark");
  const [fish, setFish] = useLocalStorage("catFocus_currency", 100);
  const [totalMinutes, setTotalMinutes] = useLocalStorage(
    "catFocus_totalMinutes",
    0,
  );
  const [history, setHistory] = useLocalStorage("catFocus_history", {});
  const [modal, setModal] = React.useState(null);
  const [inventory, setInventory] = useLocalStorage("catFocus_inventory", {
    cats: ["black"],
    chairs: ["green"],
  });
  const [catId, setCatId] = useLocalStorage("catFocus_cat", "black");
  const [chairId, setChairId] = useLocalStorage("catFocus_chair", "green");
  const [customDuration, setCustomDuration] = React.useState("");
  const [task, setTask] = React.useState("");
  const [tip, setTip] = React.useState("");
  const [tipLoading, setTipLoading] = React.useState(false);
  const [bubbles, setBubbles] = React.useState([]);
  const [scale, setScale] = React.useState(1);
  const [purchase, setPurchase] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const fileInput = React.useRef(null);
  const theme = themes[themeId];
  React.useEffect(() => {
    const ctx = document.modelContext;
    if (!ctx?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        ctx.registerTool(
          {
            name: "configure_focus_duration",
            description:
              "Set focus minutes while the timer is paused. Updates the visible timer.",
            inputSchema: {
              type: "object",
              properties: {
                minutes: {
                  type: "integer",
                  minimum: 1,
                  maximum: 999,
                },
              },
              required: ["minutes"],
              additionalProperties: false,
            },
            annotations: {
              readOnlyHint: false,
            },
            execute: async (input) => {
              if (running) throw Error("Pause the timer first");
              if (
                !input ||
                !Number.isInteger(input.minutes) ||
                input.minutes < 1 ||
                input.minutes > 999
              )
                throw Error("Minutes must be an integer from 1 to 999");
              setDuration(input.minutes);
              setRemaining(input.minutes * 60);
              await new Promise((r) =>
                requestAnimationFrame(() => requestAnimationFrame(r)),
              );
              return {
                minutes: input.minutes,
                status: "paused",
              };
            },
          },
          {
            signal: lifecycle.signal,
          },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, [running]);
  React.useEffect(() => {
    const A = () => {
      const Q = Math.min(window.innerHeight / 850, 1.2);
      const V = Math.min(window.innerWidth / 450, 1.2);
      let ll = Math.min(Q, V);
      ll = Math.max(0.6, ll);
      setScale(ll);
    };
    window.addEventListener("resize", A);
    A();
    return () => window.removeEventListener("resize", A);
  }, []);
  React.useEffect(() => {
    setRemaining(duration * 60);
  }, [duration]);
  React.useEffect(() => {
    let A = null;
    if (running && remaining > 0) {
      const end = Date.now() + remaining * 1000;
      A = setInterval(
        () => setRemaining(Math.max(0, Math.ceil((end - Date.now()) / 1000))),
        250,
      );
    } else if (remaining === 0 && running) {
      setRunning(false);
      const Q = Math.max(5, Math.floor(duration / 2));
      setFish((ll) => ll + Q);
      setTotalMinutes((ll) => ll + duration);
      const V = localDay(new Date());
      setHistory((ll) => ({
        ...ll,
        [V]: (ll[V] || 0) + duration,
      }));
      setModal("finish");
    }
    return () => clearInterval(A);
  }, [running, remaining, duration]);
  React.useEffect(() => {
    if (toast) {
      const A = setTimeout(() => setToast(null), 2e3);
      return () => clearTimeout(A);
    }
  }, [toast]);
  const toggleTimer = () => {
    if (remaining === 0) setRemaining(duration * 60);
    setRunning(!running);
  };
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secondsPart = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secondsPart}`;
  };
  const exportBackup = () => {
    const backup = {
      currency: fish,
      totalMinutes: totalMinutes,
      focusHistory: history,
      inventory: inventory,
      catId: catId,
      chairId: chairId,
      lang: language,
      initialTime: duration,
      currentThemeId: themeId,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `catfocus_backup_${localDay(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ll) => {
      try {
        const vl = JSON.parse(ll.target.result);
        if (
          !vl ||
          !Number.isFinite(vl.currency) ||
          vl.currency < 0 ||
          !Number.isFinite(vl.totalMinutes) ||
          vl.totalMinutes < 0 ||
          !vl.inventory ||
          !["cats", "chairs"].every(
            (k) =>
              Array.isArray(vl.inventory[k]) &&
              vl.inventory[k].length &&
              vl.inventory[k].every((id) =>
                catalog[k].some((x) => x.id === id),
              ),
          ) ||
          !vl.inventory.cats.includes(vl.catId) ||
          !vl.inventory.chairs.includes(vl.chairId) ||
          !translations[vl.lang] ||
          !themes[vl.currentThemeId] ||
          !Number.isInteger(vl.initialTime) ||
          vl.initialTime < 1 ||
          vl.initialTime > 999 ||
          !vl.focusHistory ||
          typeof vl.focusHistory !== "object" ||
          !Object.values(vl.focusHistory).every(
            (v) => Number.isFinite(v) && v >= 0,
          )
        )
          throw Error("Invalid backup");
        setRunning(false);
        setRemaining(vl.initialTime * 60);
        vl.currency !== void 0 && setFish(vl.currency);
        vl.totalMinutes !== void 0 && setTotalMinutes(vl.totalMinutes);
        vl.focusHistory && setHistory(vl.focusHistory);
        vl.inventory && setInventory(vl.inventory);
        vl.catId && setCatId(vl.catId);
        vl.chairId && setChairId(vl.chairId);
        vl.lang && setLanguage(vl.lang);
        vl.initialTime && setDuration(vl.initialTime);
        vl.currentThemeId && setThemeId(vl.currentThemeId);
        setToast(text.importSuccess);
      } catch {
        setToast(text.importError);
      }
    };
    reader.readAsText(file);
    fileInput.current && (fileInput.current.value = "");
  };
  const suggestFocus = async () => {
    if (!task.trim() || coachRequest.current) return;
    if (apiConfig.enabled) {
      const controller = new AbortController();
      coachRequest.current = controller;
      setTipLoading(true);
      try { setTip(await requestCoach(apiConfig, task, duration, language, controller.signal)); }
      catch (error) { setTip(error.message); }
      finally { coachRequest.current = null; setTipLoading(false); }
      return;
    }
    setTip(
      language === "zh"
        ? `喵，先把“${task.trim().slice(0, 100)}”拆成一个现在就能开始的小步骤。设定 ${duration} 分钟，只做这一步；结束后记得起身休息。`
        : `Meow! Pick one small first step for “${task.trim().slice(0, 100)}”. Focus for ${duration} minutes, then take a break.`,
    );
  };
  const petCat = (event) => {
    event.stopPropagation();
    const message = catMessages[Math.floor(Math.random() * catMessages.length)];
    const bubble = {
      id: Date.now(),
      text: message,
      x: Math.random() * 40 - 20,
      y: 0,
    };
    setBubbles((ll) => [...ll, bubble]);
    setTimeout(() => {
      setBubbles((ll) => ll.filter((vl) => vl.id !== bubble.id));
    }, 2e3);
  };
  const selectItem = (category, item) => {
    inventory[category].includes(item.id)
      ? (category === "cats" && setCatId(item.id),
        category === "chairs" && setChairId(item.id))
      : setPurchase({
          type: category,
          item: item,
        });
  };
  const confirmPurchase = () => {
    if (!purchase) return;
    const { type: category, item: item } = purchase;
    fish >= item.price
      ? (setFish((V) => V - item.price),
        setInventory((V) => ({
          ...V,
          [category]: [...V[category], item.id],
        })),
        category === "cats" && setCatId(item.id),
        category === "chairs" && setChairId(item.id),
        setPurchase(null))
      : (setPurchase(null), setToast(text.alertMoney));
  };
  const weekStats = (() => {
    const A = [];
    for (let V = 6; V >= 0; V--) {
      const ll = new Date();
      ll.setDate(ll.getDate() - V);
      const vl = localDay(ll);
      const Pn = ll.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
        weekday: "narrow",
      });
      const li = history[vl] || 0;
      A.push({
        day: Pn,
        minutes: li,
      });
    }
    const Q = Math.max(...A.map((V) => V.minutes), 60);
    return A.map((V) => ({
      ...V,
      percent: (V.minutes / Q) * 100,
    }));
  })();
  return (
    <div
      className={
        "min-h-[100dvh] w-full flex items-center justify-center font-sans select-none overflow-hidden transition-colors duration-500 relative"
      }
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=ZCOOL+KuaiLe&display=swap');
        
        .font-hand { 
          font-family: 'Gaegu', 'KaiTi', 'STKaiti', '楷体', 'SimKai', cursive; 
        }
        
        .bg-noise {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          opacity: 0.15;
          pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .text-hollow {
          -webkit-text-stroke: 3px ${theme.numStroke};
          color: transparent; 
          font-weight: 700;
          letter-spacing: 2px;
          filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.1));
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme.stroke}; border-radius: 4px; opacity: 0.5; }

        @keyframes float-up {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { transform: translateY(-20px) scale(1.1); opacity: 1; }
          100% { transform: translateY(-60px) scale(1); opacity: 0; }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px) translateX(-50%); }
          100% { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
      `}</style>
      <div className={"bg-noise"} />
      {toast && (
        <div
          className={
            "fixed top-20 left-1/2 bg-red-100 text-red-800 px-6 py-3 rounded-full border-2 border-red-300 shadow-lg z-[70] font-hand text-lg whitespace-nowrap"
          }
          style={{
            animation: "fade-in-up 0.3s ease-out forwards",
            transform: "translateX(-50%)",
          }}
        >
          {toast}
        </div>
      )}
      {purchase && (
        <div
          className={
            "fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          }
        >
          <div
            className={
              "bg-[#FFFDF5] p-6 rounded-3xl border-4 max-w-xs w-full shadow-2xl text-center transform transition-all scale-100"
            }
            style={{
              borderColor: theme.stroke,
            }}
          >
            <h3 className={"text-2xl font-hand mb-2 text-black"}>
              {text.buyConfirm}
            </h3>
            <p className={"font-hand text-lg opacity-80 mb-6 text-black"}>
              {language === "zh"
                ? `花费 ${purchase.item.price} 🐟 购买 ${purchase.item.nameZh}？`
                : `Spend ${purchase.item.price} 🐟 for ${purchase.item.nameEn}?`}
            </p>
            <div className={"flex gap-4 justify-center"}>
              <button
                onClick={() => setPurchase(null)}
                className={
                  "px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-500 font-hand hover:bg-gray-100"
                }
              >
                {text.no}
              </button>
              <button
                onClick={confirmPurchase}
                className={
                  "px-6 py-2 rounded-xl border-2 border-green-600 bg-green-100 text-green-800 font-hand hover:bg-green-200 font-bold"
                }
              >
                {text.yes}
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={
          "relative w-full h-[100dvh] max-w-md mx-auto flex flex-col z-10"
        }
      >
        <div
          className={"flex-none p-6 pt-8 flex justify-between items-start z-20"}
        >
          <div className={"flex gap-4"}>
            <button
              onClick={() => setModal("collect")}
              className={"relative group hover:opacity-70 transition-opacity"}
            >
              <span className={"font-hand text-lg tracking-wide"}>
                {text.collect}
              </span>
              <div
                className={
                  "absolute -right-2 top-0 w-2 h-2 bg-[#8BC34A] rounded-full"
                }
              />
            </button>
          </div>
          <div className={"flex gap-4"}>
            <button
              onClick={() => setModal("ai")}
              className={
                "group hover:opacity-70 transition-opacity flex items-center justify-center"
              }
              title={language === "zh" ? "猫猫专注提示" : "Focus tips"}
            >
              <Sparkles size={22} className={"text-yellow-500 animate-pulse"} />
            </button>
            <button
              onClick={() => setModal("settings")}
              className={"group hover:opacity-70 transition-opacity"}
            >
              <span className={"font-hand text-lg tracking-wide"}>
                {text.settings}
              </span>
            </button>
          </div>
        </div>
        <div className={"flex-1 flex flex-col w-full relative z-10"}>
          <div
            className={
              "flex-none flex flex-col items-center justify-center relative"
            }
            style={{
              height: "35%",
            }}
          >
            <div
              className={
                "absolute right-6 -top-[23px] transform rotate-6 w-16 h-16 pointer-events-none"
              }
              style={{
                transform: `rotate(6deg) scale(${scale})`,
              }}
            >
              <svg
                viewBox={"0 0 100 100"}
                className={"w-full h-full drop-shadow-md"}
              >
                <rect
                  x={"10"}
                  y={"10"}
                  width={"80"}
                  height={"80"}
                  fill={"#F0F4C3"}
                  stroke={"none"}
                />
                <rect
                  x={"35"}
                  y={"0"}
                  width={"30"}
                  height={"15"}
                  fill={"#C8E6C9"}
                  opacity={"0.8"}
                />
                <path
                  d={"M30,60 L30,40 L40,50 L60,50 L70,40 L70,60 Q50,75 30,60"}
                  fill={"none"}
                  stroke={"#558B2F"}
                  strokeWidth={"2"}
                />
                <circle cx={"40"} cy={"55"} r={"2"} fill={"#558B2F"} />
                <circle cx={"60"} cy={"55"} r={"2"} fill={"#558B2F"} />
                <path
                  d={"M30,30 L40,35 L35,45"}
                  stroke={"#558B2F"}
                  strokeWidth={"2"}
                  fill={"none"}
                />
              </svg>
            </div>
            <div
              role={"button"}
              tabIndex={0}
              aria-label={text.setDuration}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !running) setModal("timer");
              }}
              onClick={() => !running && setModal("timer")}
              className={
                "font-hand leading-none tracking-widest text-hollow cursor-pointer transition-transform hover:scale-105 select-none"
              }
              style={{
                fontSize: `${5.5 * scale}rem`,
              }}
            >
              {formatTime(remaining)}
            </div>
            <div
              className={"font-hand text-xl mt-1 opacity-80 tracking-wide"}
              style={{
                transform: `scale(${scale})`,
              }}
            >
              {running ? text.concentrating : text.focusTime}
            </div>
            <div
              className={
                "mt-4 relative flex items-center justify-center cursor-pointer group"
              }
              role={"button"}
              tabIndex={0}
              aria-label={running ? text.pause : text.start}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleTimer();
                }
              }}
              onClick={toggleTimer}
              style={{
                width: `${10 * scale}rem`,
                height: `${4 * scale}rem`,
              }}
            >
              <svg
                className={"absolute inset-0 w-full h-full overflow-visible"}
                viewBox={"0 0 160 60"}
              >
                <path
                  d={
                    "M10,30 Q40,5 80,5 T150,30 T80,55 T10,30 M12,28 Q40,8 80,8 T148,28 T80,52 T12,28"
                  }
                  fill={"none"}
                  stroke={theme.id === "dark" ? "#90CAF9" : "#5C6BC0"}
                  strokeWidth={"3"}
                  strokeLinecap={"round"}
                  className={"group-hover:opacity-80 transition-opacity"}
                  style={{
                    filter: "drop-shadow(0px 0px 1px rgba(0,0,0,0.2))",
                  }}
                />
              </svg>
              <span
                className={`font-hand font-bold tracking-widest z-10 ${running ? "opacity-80" : ""}`}
                style={{
                  fontSize: `${1.8 * scale}rem`,
                  textShadow: "2px 2px 0px rgba(0,0,0,0.1)",
                }}
              >
                {running ? text.pause : text.start}
              </span>
            </div>
          </div>
          <div className={"flex-1 relative w-full overflow-hidden"}>
            <div
              className={"absolute left-1/2 origin-bottom pointer-events-none"}
              style={{
                bottom: "80px",
                width: "380px",
                height: "380px",
                transform: `translateX(-50%) scale(${scale})`,
              }}
            >
              <div
                className={
                  "absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-[300px] h-[120px] transform rotate-1"
                }
              >
                <svg
                  viewBox={"0 0 200 100"}
                  className={"w-full h-full opacity-80"}
                >
                  <path
                    d={
                      "M20,50 Q20,10 100,10 Q180,10 180,50 Q180,90 100,90 Q20,90 20,50 Z"
                    }
                    fill={theme.id === "dark" ? "#B39DDB" : "#D1C4E9"}
                    stroke={"none"}
                    style={{
                      filter: "blur(1px)",
                    }}
                  />
                </svg>
              </div>
              <div
                className={
                  "absolute bottom-[81px] right-[40px] w-[80px] h-[160px] z-0"
                }
              >
                {Artwork.lamp(theme.stroke)}
              </div>
              <div
                className={
                  "absolute bottom-[80px] left-[30px] w-[90px] h-[80px] z-10"
                }
              >
                {Artwork.table(theme.stroke)}
                <div
                  className={
                    "absolute -top-[80px] left-[0px] w-[50px] h-[60px] border-4 border-[#90CAF9] bg-[#424242] flex items-center justify-center transform -rotate-3 shadow-sm"
                  }
                >
                  <div className={"text-[20px]"}>{"🐈‍⬛"}</div>
                </div>
              </div>
              <div
                className={
                  "absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-[180px] h-[200px] z-20"
                }
              >
                {Artwork.chair(
                  theme.stroke,
                  catalog.chairs.find((item) => item.id === chairId)?.color,
                )}
              </div>
              <div
                className={
                  "absolute bottom-[63px] left-1/2 -translate-x-[40%] w-[60px] h-[60px] z-30 cursor-pointer pointer-events-auto hover:scale-105 transition-transform"
                }
                onClick={petCat}
              >
                {Artwork.cat(
                  theme.stroke,
                  catalog.cats.find((item) => item.id === catId)?.color,
                )}
                {bubbles.map((item) => (
                  <div
                    className={
                      "absolute -top-10 left-1/2 bg-white px-3 py-1 rounded-full border-2 border-black font-hand text-sm whitespace-nowrap z-50 pointer-events-none"
                    }
                    style={{
                      transform: `translateX(calc(-50% + ${item.x}px))`,
                      animation: "float-up 1.5s ease-out forwards",
                    }}
                    key={item.id}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div
              className={
                "absolute bottom-[20px] w-full flex justify-between px-6 z-40 pointer-events-none"
              }
            >
              <div
                className={
                  "pointer-events-auto cursor-pointer group flex flex-col items-center hover:-translate-y-1 transition-transform"
                }
                onClick={() => setModal("stats")}
              >
                <div className={"w-[70px] h-[70px]"}>
                  {Artwork.bag(theme.stroke)}
                </div>
                <span
                  className={
                    "font-hand text-lg opacity-90 tracking-wide mt-[-5px]"
                  }
                >
                  {text.stats}
                </span>
              </div>
              <div
                className={
                  "pointer-events-auto cursor-pointer self-end hover:-translate-y-1 transition-transform"
                }
                onClick={() => setModal("shop")}
              >
                <span className={"font-hand text-lg opacity-90 tracking-wide"}>
                  {text.shop}
                </span>
              </div>
            </div>
          </div>
        </div>
        {modal && (
          <div
            className={
              "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in"
            }
          >
            <div
              className={
                "w-full max-w-sm rounded-[30px] p-6 relative shadow-2xl flex flex-col max-h-[80%]"
              }
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
                border: `3px solid ${theme.text}`,
              }}
            >
              <button
                aria-label={language === "zh" ? "关闭" : "Close"}
                onClick={() => setModal(null)}
                className={"absolute top-4 right-4 p-1 hover:opacity-50"}
              >
                <X size={24} />
              </button>
              <h2 className={"text-3xl font-hand mb-6 text-center"}>
                {modal === "collect"
                  ? text.collectionTitle
                  : modal === "stats"
                    ? text.stats
                    : modal === "ai"
                      ? text.aiCompanion
                      : modal === "finish"
                        ? language === "zh"
                          ? "专注完成"
                          : "Session complete"
                        : text[modal === "timer" ? "setDuration" : modal]}
              </h2>
              <div className={"flex-1 overflow-y-auto custom-scrollbar p-2"}>
                {modal === "ai" && (
                  <div className={"flex flex-col h-full"}>
                    <button className="font-hand text-lg mb-4 underline" onClick={() => setModal("settings")}>
                      {language === "zh" ? (apiConfig.enabled ? "大模型模式 · API 设置" : "本地提示模式 · 配置大模型 API") : (apiConfig.enabled ? "AI mode · API settings" : "Local tips · Configure model API")}
                    </button>
                    <div
                      className={
                        "flex-1 bg-black/5 rounded-2xl p-4 mb-4 overflow-y-auto font-hand text-lg"
                      }
                    >
                      {tip ? (
                        <div
                          className={"animate-in fade-in zoom-in duration-300"} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                        >
                          <span className={"text-2xl mr-2"}>{"🐱"}</span> {tip}
                        </div>
                      ) : (
                        <div className={"opacity-50 text-center mt-10"}>
                          {text.aiIntro}
                        </div>
                      )}
                    </div>
                    <div className={"flex gap-2"}>
                      <input
                        type={"text"}
                        value={task}
                        onChange={(A) => setTask(A.target.value)}
                        placeholder={text.aiPlaceholder}
                        className={
                          "flex-1 p-3 rounded-xl border-2 font-hand bg-transparent outline-none"
                        }
                        style={{
                          borderColor: theme.stroke,
                        }}
                        onKeyDown={(A) => A.key === "Enter" && suggestFocus()}
                      />
                      <button
                        onClick={suggestFocus}
                        disabled={tipLoading}
                        className={
                          "p-3 rounded-xl border-2 font-hand hover:bg-black/10 transition-colors disabled:opacity-50"
                        }
                        style={{
                          borderColor: theme.stroke,
                        }}
                      >
                        {tipLoading ? (
                          <LoaderCircle className={"animate-spin"} />
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {modal === "stats" && (
                  <div className={"space-y-6 text-center"}>
                    <div
                      className={"p-6 rounded-2xl border-2 bg-black/5"}
                      style={{
                        borderColor: theme.stroke,
                      }}
                    >
                      <div className={"text-sm opacity-70 mb-1 font-hand"}>
                        {text.totalFocus}
                      </div>
                      <div className={"text-5xl font-bold font-hand"}>
                        {totalMinutes}{" "}
                        <span className={"text-base"}>{text.minutes}</span>
                      </div>
                    </div>
                    <div className={"grid grid-cols-2 gap-4"}>
                      <div
                        className={"p-4 rounded-2xl border-2 bg-black/5"}
                        style={{
                          borderColor: theme.stroke,
                        }}
                      >
                        <div className={"text-3xl mb-1"}>{"🐟"}</div>
                        <div className={"text-2xl font-bold font-hand"}>
                          {fish}
                        </div>
                        <div className={"text-xs opacity-70 font-hand"}>
                          {"Fish"}
                        </div>
                      </div>
                      <div
                        className={"p-4 rounded-2xl border-2 bg-black/5"}
                        style={{
                          borderColor: theme.stroke,
                        }}
                      >
                        <div className={"text-3xl mb-1"}>{"🐈"}</div>
                        <div className={"text-2xl font-bold font-hand"}>
                          {inventory.cats.length}
                        </div>
                        <div className={"text-xs opacity-70 font-hand"}>
                          {"Cats"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={"p-4 rounded-2xl border-2 bg-black/5"}
                      style={{
                        borderColor: theme.stroke,
                      }}
                    >
                      <div
                        className={
                          "text-sm opacity-70 mb-3 font-hand text-left"
                        }
                      >
                        {text.weekStats}
                      </div>
                      <div
                        className={"h-32 flex items-end justify-between gap-1"}
                      >
                        {weekStats.map((item, index) => (
                          <div
                            className={"flex flex-col items-center flex-1"}
                            key={index}
                          >
                            <div
                              className={
                                "w-full mx-0.5 bg-current opacity-60 rounded-t-sm transition-all duration-500 relative group"
                              }
                              style={{
                                height: `${Math.max(item.percent, 5)}%`,
                              }}
                            >
                              <div
                                className={
                                  "absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-gray-300"
                                }
                              >
                                {item.minutes}
                                {"m"}
                              </div>
                            </div>
                            <div
                              className={
                                "text-[10px] mt-1 font-hand opacity-70"
                              }
                            >
                              {item.day}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {modal === "collect" && (
                  <div className={"space-y-6"}>
                    <ApiSettings config={apiConfig} setConfig={setApiConfig} remember={rememberKey} setRemember={setRememberKey} language={language} />
                    <div>
                      <h3
                        className={
                          "font-hand text-xl mb-3 border-b-2 border-current inline-block"
                        }
                      >
                        {text.cats}
                      </h3>
                      <div className={"grid grid-cols-3 gap-3"}>
                        {catalog.cats.map((item) => {
                          const Q = inventory.cats.includes(item.id);
                          return (
                            <div
                              className={"flex flex-col items-center"}
                              key={item.id}
                            >
                              <div
                                className={
                                  "w-16 h-16 rounded-xl border-2 flex items-center justify-center mb-1"
                                }
                                style={{
                                  borderColor: theme.stroke,
                                  backgroundColor: "rgba(0,0,0,0.05)",
                                }}
                              >
                                <div
                                  className={"w-10 h-10"}
                                  style={{
                                    color: Q ? item.color : "#888",
                                    opacity: Q ? 1 : 0.5,
                                  }}
                                >
                                  {Q ? (
                                    Artwork.cat(theme.stroke, item.color)
                                  ) : (
                                    <Lock className={"w-full h-full p-2"} />
                                  )}
                                </div>
                              </div>
                              <span className={"font-hand text-sm opacity-80"}>
                                {language === "zh" ? item.nameZh : item.nameEn}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3
                        className={
                          "font-hand text-xl mb-3 border-b-2 border-current inline-block"
                        }
                      >
                        {text.furniture}
                      </h3>
                      <div className={"grid grid-cols-3 gap-3"}>
                        {catalog.chairs.map((item) => {
                          const Q = inventory.chairs.includes(item.id);
                          return (
                            <div
                              className={"flex flex-col items-center"}
                              key={item.id}
                            >
                              <div
                                className={
                                  "w-16 h-16 rounded-xl border-2 flex items-center justify-center mb-1"
                                }
                                style={{
                                  borderColor: theme.stroke,
                                  backgroundColor: "rgba(0,0,0,0.05)",
                                }}
                              >
                                <div
                                  className={"w-10 h-10"}
                                  style={{
                                    color: Q ? item.color : "#888",
                                    opacity: Q ? 1 : 0.5,
                                  }}
                                >
                                  {Q ? (
                                    <div
                                      className={
                                        "w-full h-full rounded bg-current opacity-80"
                                      }
                                    />
                                  ) : (
                                    <Lock className={"w-full h-full p-2"} />
                                  )}
                                </div>
                              </div>
                              <span className={"font-hand text-sm opacity-80"}>
                                {language === "zh" ? item.nameZh : item.nameEn}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {modal === "settings" && (
                  <div className={"space-y-6"}>
                    <div>
                      <h3
                        className={
                          "font-hand text-xl mb-3 border-b-2 border-current inline-block"
                        }
                      >
                        {text.theme}
                      </h3>
                      <div className={"flex gap-2"}>
                        {Object.values(themes).map((item) => (
                          <button
                            onClick={() => setThemeId(item.id)}
                            className={`w-10 h-10 rounded-full border-2 ${themeId === item.id ? "ring-2 ring-offset-2 ring-current" : ""}`}
                            style={{
                              backgroundColor: item.bg,
                              borderColor: item.stroke,
                            }}
                            key={item.id}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3
                        className={
                          "font-hand text-xl mb-3 border-b-2 border-current inline-block"
                        }
                      >
                        {text.language}
                      </h3>
                      <div className={"flex gap-4 font-hand text-lg"}>
                        <button
                          onClick={() => setLanguage("en")}
                          className={
                            language === "en" ? "underline" : "opacity-50"
                          }
                        >
                          {"English"}
                        </button>
                        <button
                          onClick={() => setLanguage("zh")}
                          className={
                            language === "zh" ? "underline" : "opacity-50"
                          }
                        >
                          {"中文"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3
                        className={
                          "font-hand text-xl mb-3 border-b-2 border-current inline-block"
                        }
                      >
                        {language === "zh" ? "本机数据与备份" : text.backup}
                      </h3>
                      <div className={"flex flex-col gap-2"}>
                        <button
                          onClick={exportBackup}
                          className={
                            "flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-hand hover:bg-black/5"
                          }
                          style={{
                            borderColor: theme.stroke,
                          }}
                        >
                          <Save size={18} /> {text.export}
                        </button>
                        <div className={"relative"}>
                          <input
                            type={"file"}
                            accept={".json"}
                            onChange={importBackup}
                            ref={fileInput}
                            className={
                              "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            }
                          />
                          <button
                            className={
                              "w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-hand hover:bg-black/5"
                            }
                            style={{
                              borderColor: theme.stroke,
                            }}
                          >
                            <Upload size={18} /> {text.import}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {modal === "timer" && (
                  <div className={"flex flex-col gap-4"}>
                    <div className={"grid grid-cols-2 gap-4"}>
                      {[10, 25, 45, 60].map((item) => (
                        <button
                          onClick={() => {
                            setDuration(item);
                            setModal(null);
                          }}
                          className={`p-4 rounded-xl border-2 font-hand text-2xl ${duration === item ? "bg-black/10" : ""}`}
                          style={{
                            borderColor: theme.stroke,
                          }}
                          key={item}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <div
                      className={"border-t-2 border-dashed pt-4 mt-2"}
                      style={{
                        borderColor: theme.stroke,
                      }}
                    >
                      <label
                        className={"block font-hand text-lg mb-2 opacity-70"}
                      >
                        {text.customTime}
                        {" ("}
                        {text.minutes}
                        {")"}
                      </label>
                      <div className={"flex gap-2"}>
                        <input
                          type={"number"}
                          min={"1"}
                          max={"999"}
                          value={customDuration}
                          onChange={(A) => setCustomDuration(A.target.value)}
                          className={
                            "flex-1 p-2 rounded-xl border-2 font-hand bg-transparent outline-none text-center text-xl"
                          }
                          style={{
                            borderColor: theme.stroke,
                          }}
                        />
                        <button
                          onClick={() => {
                            const A = parseInt(customDuration);
                            Number.isInteger(A) &&
                              A >= 1 &&
                              A <= 999 &&
                              (setDuration(A), setModal(null));
                          }}
                          className={
                            "px-6 rounded-xl border-2 font-hand hover:bg-black/10"
                          }
                          style={{
                            borderColor: theme.stroke,
                          }}
                        >
                          {text.set}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {modal === "shop" && (
                  <div className={"space-y-8"}>
                    <div>
                      <h3 className={"font-hand text-xl mb-3"}>{text.cats}</h3>
                      <div className={"flex gap-4"}>
                        {catalog.cats.map((item) => {
                          const Q = inventory.cats.includes(item.id);
                          const V = catId === item.id;
                          return (
                            <div
                              onClick={() => selectItem("cats", item)}
                              className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center cursor-pointer relative ${V ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}
                              style={{
                                borderColor: theme.stroke,
                                opacity: Q ? 1 : 0.6,
                              }}
                              key={item.id}
                            >
                              <div
                                className={"w-8 h-8 rounded-full"}
                                style={{
                                  backgroundColor: item.color,
                                  border: "1px solid #000",
                                }}
                              />
                              {!Q && (
                                <div
                                  className={
                                    "absolute -bottom-2 -right-2 bg-white text-xs px-1 rounded border shadow-sm font-hand"
                                  }
                                >
                                  {text.price}
                                  {item.price}
                                </div>
                              )}
                              {Q && V && (
                                <div
                                  className={
                                    "absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5"
                                  }
                                >
                                  <Check size={12} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className={"font-hand text-xl mb-3"}>
                        {text.furniture}
                      </h3>
                      <div className={"flex gap-4"}>
                        {catalog.chairs.map((item) => {
                          const Q = inventory.chairs.includes(item.id);
                          const V = chairId === item.id;
                          return (
                            <div
                              onClick={() => selectItem("chairs", item)}
                              className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center cursor-pointer relative ${V ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}
                              style={{
                                borderColor: theme.stroke,
                                opacity: Q ? 1 : 0.6,
                              }}
                              key={item.id}
                            >
                              <div
                                className={"w-8 h-8 rounded-md"}
                                style={{
                                  backgroundColor: item.color,
                                  border: "1px solid #000",
                                }}
                              />
                              {!Q && (
                                <div
                                  className={
                                    "absolute -bottom-2 -right-2 bg-white text-xs px-1 rounded border shadow-sm font-hand"
                                  }
                                >
                                  {text.price}
                                  {item.price}
                                </div>
                              )}
                              {Q && V && (
                                <div
                                  className={
                                    "absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5"
                                  }
                                >
                                  <Check size={12} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {modal === "finish" && (
                  <div className={"text-center"}>
                    <div
                      className={"text-6xl mb-4"}
                    >{`🐟 +${Math.max(5, Math.floor(duration / 2))}`}</div>
                    <button
                      onClick={() => {
                        setModal(null);
                        setRemaining(duration * 60);
                      }}
                      className={
                        "px-8 py-3 rounded-full border-2 font-hand text-2xl hover:bg-black/10 transition-colors"
                      }
                      style={{
                        borderColor: theme.stroke,
                      }}
                    >
                      {language === "zh"
                        ? "完成，休息一下"
                        : "Done — take a break"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
