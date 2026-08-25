/**
 * Avaliador de fórmulas aritméticas seguro (sem eval/Function).
 *
 * Usado no M2 para valores derivados de atributos (ex.: modificador d20
 * "floor((value - 10) / 2)"). É a semente do motor de dados do M4, que
 * estenderá isto com rolagens.
 *
 * Suporta: números, + - * / %, menos unário, parênteses, variáveis e as
 * funções floor, ceil, round, abs, min, max, sqrt.
 */

type Token = {
  type: "num" | "ident" | "op" | "lparen" | "rparen" | "comma";
  value: string;
};

const FUNCS: Record<string, (...a: number[]) => number> = {
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  abs: Math.abs,
  min: Math.min,
  max: Math.max,
  sqrt: Math.sqrt,
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(input[i + 1] ?? ""))) {
      let num = "";
      while (i < input.length && /[0-9.]/.test(input[i])) num += input[i++];
      tokens.push({ type: "num", value: num });
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let id = "";
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) id += input[i++];
      tokens.push({ type: "ident", value: id });
      continue;
    }
    if ("+-*/%".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }
    if (c === "(") {
      tokens.push({ type: "lparen", value: c });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rparen", value: c });
      i++;
      continue;
    }
    if (c === ",") {
      tokens.push({ type: "comma", value: c });
      i++;
      continue;
    }
    throw new Error(`Caractere inválido na fórmula: '${c}'`);
  }
  return tokens;
}

export function evalFormula(
  expr: string,
  vars: Record<string, number> = {},
): number {
  const tokens = tokenize(expr);
  let pos = 0;
  const peek = (): Token | undefined => tokens[pos];
  const next = (): Token | undefined => tokens[pos++];

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
        left = t.value === "*" ? left * right : t.value === "/" ? left / right : left % right;
      } else break;
    }
    return left;
  }

  function parseFactor(): number {
    const t = peek();
    if (t?.type === "op" && t.value === "-") {
      next();
      return -parseFactor();
    }
    if (t?.type === "op" && t.value === "+") {
      next();
      return parseFactor();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const t = next();
    if (!t) throw new Error("Fórmula incompleta");
    if (t.type === "num") return parseFloat(t.value);
    if (t.type === "lparen") {
      const v = parseExpr();
      if (next()?.type !== "rparen") throw new Error("Falta ')'");
      return v;
    }
    if (t.type === "ident") {
      if (peek()?.type === "lparen") {
        next();
        const args: number[] = [];
        if (peek()?.type !== "rparen") {
          args.push(parseExpr());
          while (peek()?.type === "comma") {
            next();
            args.push(parseExpr());
          }
        }
        if (next()?.type !== "rparen") throw new Error("Falta ')'");
        const fn = FUNCS[t.value];
        if (!fn) throw new Error(`Função desconhecida: ${t.value}`);
        return fn(...args);
      }
      if (t.value in vars) return vars[t.value];
      throw new Error(`Variável desconhecida: ${t.value}`);
    }
    throw new Error(`Token inesperado: '${t.value}'`);
  }

  const result = parseExpr();
  if (pos < tokens.length) throw new Error("Fórmula malformada");
  return result;
}

/** Avalia uma fórmula; retorna null se houver erro. */
export function tryEvalFormula(
  expr: string,
  vars: Record<string, number> = {},
): number | null {
  try {
    return evalFormula(expr, vars);
  } catch {
    return null;
  }
}
