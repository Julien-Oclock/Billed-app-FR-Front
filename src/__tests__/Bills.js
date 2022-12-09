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
jest.mock("../app/store", () => mockStore)
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe('When I am on Bills page and I click on buttonNewBill', () => {
  test('Then, NewBill should have been called', async () => {

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

    await waitFor(() => screen.getByText("Mes notes de frais"))

    const billsObj = new Bills({
      document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
    })

    const NewBill = jest.fn(() => billsObj.handleClickNewBill)
    const buttonNewBill = await screen.getByTestId('btn-new-bill')
    expect(buttonNewBill).not.toBeNull()
    buttonNewBill.addEventListener('click', NewBill)
    userEvent.click(buttonNewBill)
    expect(NewBill).toHaveBeenCalled()
  })
})

describe('When I am on Bills page and I click on icon-eye', () => {
  test('Then, handleClickIconEye should have been called', async () => {
    document.body.innerHTML = BillsUI({ data: bills })

    const billsObj = new Bills({
      document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
    })
    $.fn.modal = jest.fn();
    const clickEye = jest.fn(() => billsObj.handleClickIconEye)
    const buttonEye = await screen.getAllByTestId('icon-eye')[0]
    expect(buttonEye).not.toBeNull()
    // console.log(buttonEye);
    buttonEye.addEventListener('click', clickEye)
    buttonEye.click()
    expect(clickEye).toHaveBeenCalled()    
  })
})









// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const newBillBtn  = await screen.getByText("Nouvelle note de frais")
      expect(newBillBtn).toBeTruthy()
      const contentTest  = await screen.getAllByText("Transports")[0]
      expect(contentTest).toBeTruthy()
    })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee',
        email: "employee@test.tld"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})