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

    test("Then form new bill should be truthy", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
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

      const newBillObj = new NewBill({
        document, onNavigate, store: mockStore, bills:bills, localStorage: window.localStorage
      })

      const fileChengeBtn = screen.getByTestId("file")
      expect(fileChengeBtn).toBeTruthy()
      const fileChengeFn = jest.fn((e) => newBillObj.handleChangeFile(e))
      fileChengeBtn.addEventListener('click', fileChengeFn)
      const fakeFile = new File(['(⌐□_□)'], 'image.jpg', { type: 'image/jpg' });
      userEvent.click(fileChengeBtn, {
        target: { files: [fakeFile] }
      });
      expect(fileChengeFn).toHaveBeenCalled()

      const fakeFile2 = new File(['(⌐□_□)'], 'image.pdf', { type: 'image/pdf' });
      userEvent.click(fileChengeBtn, {
        target: { files: [fakeFile2] }
      });
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
      console.log = jest.fn();
      const sendBillBtn = document.getElementById("btn-send-bill")
      const handleSubmit = jest.fn((e) => handleSubmit)
      sendBillBtn.addEventListener("click", handleSubmit)
      userEvent.click(sendBillBtn)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

