import { describe, expect, it } from "vitest";
import { restaurantZoneFromAddress, COMARCAS } from "@/lib/restaurant-zones";

describe("restaurantZoneFromAddress", () => {
  it("mapea la ciudad de Huesca a la Hoya de Huesca", () => {
    expect(restaurantZoneFromAddress("Av. del Parque, 1, Huesca")).toBe("Hoya de Huesca");
  });

  it("mapea municipios del Somontano", () => {
    expect(restaurantZoneFromAddress("Calle Mayor, Barbastro")).toBe("Somontano de Barbastro");
  });

  it("mapea municipios del Sobrarbe", () => {
    expect(restaurantZoneFromAddress("Plaza Mayor, Aínsa")).toBe("Sobrarbe");
  });

  it("mapea municipios de la Ribagorza", () => {
    expect(restaurantZoneFromAddress("Benasque")).toBe("Ribagorza");
  });

  it("mapea Jaca a la Jacetania", () => {
    expect(restaurantZoneFromAddress("Av. de Francia, 2, Jaca")).toBe("Jacetania");
  });

  it("mapea Fraga al Bajo Cinca", () => {
    expect(restaurantZoneFromAddress("Calle Mayor, Fraga")).toBe("Bajo Cinca");
  });

  it("devuelve null cuando la dirección no identifica un municipio de la provincia", () => {
    expect(restaurantZoneFromAddress("Paseo de la Independencia, Zaragoza")).toBeNull();
  });

  it("devuelve null con dirección vacía o nula", () => {
    expect(restaurantZoneFromAddress(null)).toBeNull();
    expect(restaurantZoneFromAddress("")).toBeNull();
  });

  it("no se ve afectado por tildes ni mayúsculas", () => {
    expect(restaurantZoneFromAddress("AINSA")).toBe("Sobrarbe");
  });

  it("expone una lista no vacía de comarcas ordenadas", () => {
    expect(COMARCAS.length).toBeGreaterThan(5);
    expect(COMARCAS).toContain("Hoya de Huesca");
  });
});