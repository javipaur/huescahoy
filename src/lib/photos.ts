export type Photo = {
  url: string;
  page: string;
  author: string;
  license: string;
  alt: string;
};

export const photos = {
  fuegosSanLorenzo: {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Catedral_de_Huesca_con_fuegos_artificiales_durante_las_fiestas_de_San_Lorenzo.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Catedral_de_Huesca_con_fuegos_artificiales_durante_las_fiestas_de_San_Lorenzo.jpg",
    author: "Saul Moya",
    license: "CC BY-SA 4.0",
    alt: "Fuegos artificiales sobre la catedral de Huesca durante las fiestas de San Lorenzo",
  },
  semanaSanta: {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Huesca._Semana_Santa._Plaza_de_la_Catedral._%28157466246%29.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Huesca._Semana_Santa._Plaza_de_la_Catedral._(157466246).jpg",
    author: "Fernando",
    license: "CC BY-SA 2.0",
    alt: "Procesión de Semana Santa en la plaza de la Catedral de Huesca",
  },
  bombos: {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Bombos_Semana_Santa_Huesca.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Bombos_Semana_Santa_Huesca.jpg",
    author: "Fernando",
    license: "CC BY-SA 2.0",
    alt: "Bombos en la Semana Santa de Huesca",
  },
  plazaNavarra: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/03/Huesca_-_Plaza_de_Navarra%2C_Fuente_de_las_Musas_3.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Huesca_-_Plaza_de_Navarra,_Fuente_de_las_Musas_3.jpg",
    author: "Zarateman",
    license: "CC0",
    alt: "Plaza de Navarra con la fuente de las Musas en Huesca",
  },
} satisfies Record<string, Photo>;
