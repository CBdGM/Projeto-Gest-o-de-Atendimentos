declare module "numero-por-extenso" {
  export function porExtenso(
    numero: number,
    estilo?: any,
    genero?: "masculino" | "feminino"
  ): string;

  export const estilo: {
    normal: string;
    monetario: string;
    por: string;
  };
}