interface WorkshopFeatures {
  clientForm: {
    saveButtonBugs: boolean
    cancelButtonBugs: boolean
    pictureBugs: boolean
    birthdayInputBugs: boolean
    telephoneInputBugs: boolean
    emailFieldBugs: boolean
    cpfFieldBugs: boolean
    rgFieldBugs: boolean
    cepFieldBugs: boolean
    houseNumberFieldBugs: boolean
    cityFieldBugs: boolean
    stateFieldBugs: boolean
    clientTypesFieldBugs: boolean
    errorContactRelationshipBugs: boolean


    addingTimeToAddingInteractions: boolean
  }
}

/*
* Configuration for workshop feature bugs panel
* saveButtonBugs: Presença do botão de salvar (false)
* cancelButtonBugs: Presença do botão de cancelar (false)
* pictureBugs: Presença dos bugs no campo de foto (true)
* birthdayInputBugs: Presença dos bugs no campo de data de nascimento (true)
* telephoneInputBugs: Presença dos bugs no campo de telefone (true)
* emailFieldBugs: Presença dos bugs no campo de email (true)
* cpfFieldBugs: Presença dos bugs no campo de CPF (true)
* rgFieldBugs: Presença dos bugs no campo de RG (true)
* cepFieldBugs: Presença dos bugs no campo de CEP (true)
* houseNumberFieldBugs: Presença dos bugs no campo de número da casa (true)
* cityFieldBugs: Presença dos bugs no campo de cidade (true)
* stateFieldBugs: Presença dos bugs no campo de estado (true)
* clientTypesFieldBugs: Presença dos bugs no campo de tipos de cliente (true)
* errorContactRelationshipBugs: Presença dos bugs no campo de relacionamento de contato (true)
* addingTimeToAddingInteractions: Adiciona tempo de delay na interação ao adicionar interações (false)
*/
export const WORKSHOP_FEATURES_BUGS: WorkshopFeatures = {
  clientForm: {
    saveButtonBugs: true,
    cancelButtonBugs: true,
    pictureBugs: true,
    birthdayInputBugs: true,
    telephoneInputBugs: true,
    emailFieldBugs: true,
    cpfFieldBugs: true,
    rgFieldBugs: true,
    cepFieldBugs: true,
    houseNumberFieldBugs: true,
    cityFieldBugs: true,
    stateFieldBugs: true,
    clientTypesFieldBugs: true,
    errorContactRelationshipBugs: true,
    addingTimeToAddingInteractions: false 
  },
}