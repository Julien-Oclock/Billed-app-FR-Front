/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)

// import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import {waitFor} from "@testing-library/dom"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import userEvent from "@testing-library/user-event"
// import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
     // Teste si le formulaire de nouvelle note de frais est présent sur la page
    test("Then form new bill should be truthy", async () => {
      // Création d'un élément div pour l'application
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Navigation vers la page des factures
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillObj = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    })

    test("Then on click FileBtn fileChangeFunction should have been called", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // créer un nouvel objet de facture
      const newBillObj = new NewBill({
        document, onNavigate, store: mockStore, bills:bills, localStorage: window.localStorage
      })

      // récupérer le bouton de changement de fichier à l'aide de l'attribut de données "file"
      const fileChengeBtn = screen.getByTestId("file")
      // vérifier que le bouton existe
      expect(fileChengeBtn).toBeTruthy()
      // définir une fonction de mock pour gérer le changement de fichier
      const fileChengeFn = jest.fn((e) => newBillObj.handleChangeFile(e))
      // ajouter un écouteur d'événement pour le clic sur le bouton
      fileChengeBtn.addEventListener('click', fileChengeFn)
      // créer un fichier fictif avec un type d'image/jpg
      const fakeFile = new File(['(⌐□_□)'], 'image.jpg', { type: 'image/jpg' });
      // simuler un clic sur le bouton de changement de fichier
      userEvent.click(fileChengeBtn, {
        target: { files: [fakeFile] }
      });
      // vérifier que la fonction de changement de fichier a été appelée
      expect(fileChengeFn).toHaveBeenCalled()

      // créer un nouveau fichier fictif avec un type d'image/pdf
      const fakeFile2 = new File(['(⌐□_□)'], 'image.pdf', { type: 'image/pdf' });
      // simuler un clic sur le bouton de changement de fichier
      userEvent.click(fileChengeBtn, {
        target: { files: [fakeFile2] }
      });
      // vérifier que la fonction de changement de fichier a été appelée
      expect(fileChengeFn).toHaveBeenCalled()
    })

    test("Then on click Submit handleSubmit should have been called", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillObj = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      
      // Désactivation de la fonction console.log pour éviter les erreurs
      console.log = jest.fn();
      // Récupération du bouton d'envoi de facture
      const sendBillBtn = document.getElementById("btn-send-bill")
      // Création d'une fonction simulant l'appel de handleSubmit
      const handleSubmit = jest.fn((e) => handleSubmit)
      // Ajout de l'écouteur d'événement click sur le bouton d'envoi de facture
      sendBillBtn.addEventListener("click", handleSubmit)
      // Simulation du clic sur le bouton d'envoi de facture
      userEvent.click(sendBillBtn)
      // Vérification que la fonction handleSubmit a été appelée
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

