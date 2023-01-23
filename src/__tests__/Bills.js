/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import mockStore from "../__mocks__/store"
jest.mock("../app/Store", () => mockStore)
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Test de la surbrillance de l'icône "Mes notes de frais" dans le menu vertical (signifie que l'on est sur la page des factures)
    test("Then bill icon in vertical layout should be highlighted", async () => {
      //Mock de localStorage pour simuler une connexion utilisateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      //Création d'un élément div pour l'application
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      //Navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills)
      //Attente que l'élément icône soit disponible avant de continuer
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //Vérification que l'icône a la classe 'active-icon'
      expect(windowIcon).toHaveClass('active-icon')
    })
    // test du tris des Bills (par date)
    test("Then bills should be ordered from earliest to latest", () => {
      //Insertion du code HTML de la page des factures
      document.body.innerHTML = BillsUI({ data: bills })
      //Récupération de toutes les dates
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      //Fonction de tri décroissant
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      //Tri des dates
      const datesSorted = [...dates].sort(antiChrono)
      //Vérification que les dates sont triées
      expect(dates).toEqual(datesSorted)
    })
  })
})


describe('When I am on Bills page and I click on buttonNewBill', () => {
  test('Then, NewBill should have been called', async () => {
    //Mock de localStorage pour simuler une connexion utilisateur
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    //Création d'un élément div 
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    //Navigation vers la page des factures
    window.onNavigate(ROUTES_PATH.Bills)
    //Attente que l'élément "Mes notes de frais" soit disponible avant de continuer
    await waitFor(() => screen.getByText("Mes notes de frais"))

    //Création d'une instance de la classe Bills pour gérer les fonctionnalités de la page des factures
    const billsObj = new Bills({
      document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
    })

    // vérification de l'appel de la fonction handleClickNewBill() lors du clic sur le bouton "Nouvelle facture" et que le bouton existe bien
    const NewBill = jest.fn(() => billsObj.handleClickNewBill)
    const buttonNewBill = await screen.getByTestId('btn-new-bill')
    expect(buttonNewBill).not.toBeNull()

    //Ajout d'un écouteur d'événements 'click' sur le bouton qui appelle la fonction Nouvelle facture
    buttonNewBill.addEventListener('click', NewBill)
    //Simulation d'un clic sur le bouton
    userEvent.click(buttonNewBill)

    //Vérification que le formualaire newbill a bien été appelée
    expect(NewBill).toHaveBeenCalled()
  })
})


describe('When I am on Bills page and I click on icon-eye', () => {
  test('Then, handleClickIconEye should have been called', async () => {
    //Insertion du code HTML de la page des factures
    document.body.innerHTML = BillsUI({ data: bills })

    //Création d'une instance de la classe Bills pour gérer les fonctionnalités de la page des factures
    const billsObj = new Bills({
      document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
    })
    //Mock de la fonction modal de Jquery
    $.fn.modal = jest.fn();
    //Définition de la fonction clickEye pour appeler la fonction handleClickIconEye de billsObj
    const clickEye = jest.fn(() => billsObj.handleClickIconEye)
    //Récupération de tous les boutons "Oeil"
    const buttonEye = await screen.getAllByTestId('icon-eye')[0]
    //Vérification que le bouton existe bien
    expect(buttonEye).not.toBeNull()
    //Ajout d'un écouteur d'événements 'click' sur le bouton qui appelle la fonction clickEye
    buttonEye.addEventListener('click', clickEye)
    //Simulation d'un clic sur le bouton
    buttonEye.click()
    //Vérification que la fonction clickEye a bien été appelée
    expect(clickEye).toHaveBeenCalled()    
  })
})


// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      //Mock de localStorage pour simuler une connexion utilisateur
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }));
      //Création d'un élément div
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      //Navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills)
      //Attente que l'élément "Mes notes de frais" soit disponible avant de continuer
      await waitFor(() => screen.getByText("Mes notes de frais"))
      //Vérification que les notes de frais sont bien affichées
      const newBillBtn  = await screen.getByText("Nouvelle note de frais")
      //Vérification que le bouton "Nouvelle note de frais" est bien affiché
      expect(newBillBtn).toBeTruthy()
      const contentTest  = await screen.getAllByText("Transports")[0]
      //Vérification que la note de frais "Transports" est bien affichée
      expect(contentTest).toBeTruthy()
    })

  describe("When an error occurs on API", () => {
    //Mock de la fonction modal de Jquery
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      //Mock de localStorage pour simuler une connexion utilisateur
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee',
        email: "employee@test.tld"
      }))
      //Création d'un élément div
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      //Mock de la fonction list de la classe Bills
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      //Navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills)
      //Attente que l'élément "Mes notes de frais" soit disponible avant de continuer
      await new Promise(process.nextTick);
      //Vérification que le message d'erreur est bien affiché
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      //Mock de la fonction list de la classe Bills
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      //Navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      //Vérification que le message d'erreur est bien affiché
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})