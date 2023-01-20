// Cette fonction permet de formater une date en utilisant la locale française
export const formatDate = (dateStr) => {
  // Création d'un objet date avec la date passée en paramètre
  const date = new Date(dateStr)
  // Récupération de l'année au format numérique en français
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  // Récupération du mois en abrégé en français
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  // Récupération du jour au format "jj" en français
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  // Capitalisation du premier caractère du mois
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  // Retourne la date formatée sous la forme "jj mois. yy"
  return `${parseInt(da)} ${month.substring(0,3)}. ${ye.toString().substring(2,4)}`
}


// Cette fonction permet de traduire en français le statut d'une facture
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refusé"
  }
}