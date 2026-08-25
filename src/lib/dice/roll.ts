/**
 * Motor de rolagem de dados.
 *
 * Suporta: NdM (ex.: 2d6, d20), aritmética + - * / % com parênteses e menos
 * unário, manter/descartar (kh/kl/dh/dl) e variáveis {nome}.
 * Exemplos: "2d6+3", "1d20+5", "4d6kh3" (4d6 mantendo os 3 maiores),
 * "2d20kh1" (vantagem), "2d20kl1" (desvantagem).
 */

export type DiceGroup = {
  notation: string;
  rolls: number[];
  kept: number[];
  subtotal: number;
};

export type RollOutcome = {
  expression: string;
  total: number;
  groups: DiceGroup[];
  detail: string;
};

type RNG = () => number;
type KeepSpec = { mode: "kh" | "kl" | "dh" | "dl"; n: number };

type Token =
  | { type: "num"; value: number }
  | { type: "dice"; count: number; sides: number; keep: KeepSpec | null; raw: string }
  | { type: "var"; name: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" };

const MAX_DICE = 1000;
const MAX_SIDES = 10000;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let s = input;
  const diceRe = /^(\d*)d(\d+)((kh|kl|dh|dl)(\d*))?/i;
  const numRe = /^\d+(\.\d+)?/;
  const varRe = /^\{([^}]+)\}/;

  while (s.length > 0) {
    const c = s[0];
    if (c === " " || c === "\t") {
      s = s.slice(1);
      continue;
    }

    const dice = s.match(diceRe);
    if (dice) {
      const count = dice[1] === "" ? 1 : parseInt(dice[1], 10);
      const sides = parseInt(dice[2], 10);
      let keep: KeepSpec | null = null;
      if (dice[4]) {
        const mode = dice[4].toLowerCase() as KeepSpec["mode"];
        const n = !dice[5] ? 1 : parseInt(dice[5], 10);
        keep = { mode, n };
      }
      tokens.push({ type: "dice", count, sides, keep, raw: dice[0] });
      s = s.slice(dice[0].length);
      continue;
    }

    const v = s.match(varRe);
    if (v) {
      tokens.push({ type: "var", name: v[1] });
      s = s.slice(v[0].length);
      continue;
    }

    const num = s.match(numRe);
    if (num) {
      tokens.push({ type: "num", value: parseFloat(num[0]) });
      s = s.slice(num[0].length);
      continue;
    }

    if ("+-*/%".includes(c)) {
      tokens.push({ type: "op", value: c });
      s = s.slice(1);
      continue;
    }
    if (c === "(") {
      tokens.push({ type: "lparen" });
      s = s.slice(1);
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rparen" });
      s = s.slice(1);
      continue;
    }
    throw new Error(`Caractere inválido: '${c}'`);
  }
  return tokens;
}

export function evaluate(
  expression: string,
  vars: Record<string, number> = {},
  rng: RNG = Math.random,
): RollOutcome {
  const tokens = tokenize(expression);
  let pos = 0;
  const groups: DiceGroup[] = [];
  const peek = (): Token | undefined => tokens[pos];
  const next = (): Token | undefined => tokens[pos++];

  function rollDice(
    count: number,
    sides: number,
    keep: KeepSpec | null,
    raw: string,
  ): number {
    if (count < 1 || count > MAX_DICE)
      throw new Error(`Quantidade de dados inválida (${count}).`);
    if (sides < 1 || sides > MAX_SIDES)
      throw new Error(`Número de lados inválido (${sides}).`);

    const rolls: number[] = [];
    for (let i = 0; i < count; i++) rolls.push(Math.floor(rng() * sides) + 1);

    let kept = rolls;
    if (keep) {
      const sorted = [...rolls].sort((a, b) => a - b);
      const n = Math.min(Math.max(keep.n, 0), count);
      if (keep.mode === "kh") kept = sorted.slice(count - n);
      else if (keep.mode === "kl") kept = sorted.slice(0, n);
      else if (keep.mode === "dl") kept = sorted.slice(n);
      else kept = sorted.slice(0, count - n); // dh
    }

    const subtotal = kept.reduce((a, b) => a + b, 0);
    groups.push({ notation: raw, rolls, kept, subtotal });
    return subtotal;
  }

  function parseExpr(): number {
    let left = parseTerm();
    for (;;) {
      const t = peek();
      if (t?.type === "op" && (t.value === "+" || t.value === "-")) {
        next();
        const right = parseTerm();
        left = t.value === "+" ? left + right : left - right;
      } else break;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    for (;;) {
      const t = peek();
      if (t?.type === "op" && ["*", "/", "%"].includes(t.value)) {
        next();
        const right = parseFactor();
        left =
          t.value === "*" ? left * right : t.value === "/" ? left / right : left % right;
      } else break;
    }
    return left;
  }

  function parseFactor(): number {
    const t = peek();
    if (t?.type === "op" && (t.value === "-" || t.value === "+")) {
      next();
      return t.value === "-" ? -parseFactor() : parseFactor();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const t = next();
    if (!t) throw new Error("Expressão incompleta.");
    if (t.type === "num") return t.value;
    if (t.type === "dice") return rollDice(t.count, t.sides, t.keep, t.raw);
    if (t.type === "var") return vars[t.name] ?? 0;
    if (t.type === "lparen") {
      const value = parseExpr();
      if (next()?.type !== "rparen") throw new Error("Falta ')'.");
      return value;
    }
    throw new Error("Expressão malformada.");
  }

  const total = parseExpr();
  if (pos < tokens.length) throw new Error("Expressão malformada.");

  const detail = groups
    .map((g) => {
      const dropped = g.rolls.length !== g.kept.length;
      return `${g.notation}: [${g.rolls.join(", ")}]${
        dropped ? ` → mantém [${g.kept.join(", ")}]` : ""
      }`;
    })
    .join("   ");

  return { expression, total, groups, detail };
}

export function safeEvaluate(
  expression: string,
  vars?: Record<string, number>,
  rng?: RNG,
): { ok: true; outcome: RollOutcome } | { ok: false; error: string } {
  try {
    return { ok: true, outcome: evaluate(expression, vars, rng) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Expressão inválida.",
    };
  }
}
