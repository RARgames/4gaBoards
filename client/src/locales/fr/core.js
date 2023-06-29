import dateFns from 'date-fns/locale/fr';

export default {
  dateFns,

  format: {
    date: 'd.MM.yyyy',
    time: 'HH:mm',
    dateTime: '$t(format:date) $t(format:time)',
  },

  translation: {
    common: {
      account: 'Compte',
      actions: 'Actions',
      addAttachment_title: 'Ajouter une pièce jointe',
      addComment: 'Ajouter un commentaire',
      addMember_title: 'Ajouter un membre',
      addUser_title: 'Ajouter un utilisateur',
      administrator: 'Administrateur',
      all: 'Tout',
      allChangesWillBeAutomaticallySavedAfterConnectionRestored: 'Toutes les modifications seront automatiquement enregistrées <br /> une fois la connexion rétablie',
      areYouSureYouWantToDeleteThisAttachment: 'Voulez-vous vraiment supprimer cette pièce jointe?',
      areYouSureYouWantToDeleteThisBoard: 'Êtes-vous sûr de vouloir supprimer ce forum?',
      areYouSureYouWantToDeleteThisCard: 'Voulez-vous vraiment supprimer cette carte?',
      areYouSureYouWantToDeleteThisComment: 'Êtes-vous sûr de vouloir supprimer ce commentaire?',
      areYouSureYouWantToDeleteThisLabel: 'Voulez-vous vraiment supprimer ce libellé?',
      areYouSureYouWantToDeleteThisList: 'Êtes-vous sûr de vouloir supprimer cette liste?',
      areYouSureYouWantToDeleteThisProject: 'Êtes-vous sûr de vouloir supprimer ce projet?',
      areYouSureYouWantToDeleteThisTask: 'Êtes-vous sûr de vouloir supprimer cette tâche?',
      areYouSureYouWantToDeleteThisUser: 'Êtes-vous sûr de vouloir supprimer cet utilisateur?',
      areYouSureYouWantToRemoveThisMemberFromProject: 'Êtes-vous sûr de vouloir supprimer ce membre du projet?',
      attachment: 'Attachement',
      attachments: 'Pièces jointes',
      authentication: 'Authentification',
      board: 'Tableau',
      boardNotFound_title: 'Carte non trouvée',
      cardActions_title: 'Actions sur la carte',
      cardNotFound_title: 'Carte non trouvée',
      cardOrActionAreDeleted: "La carte ou l'action sont supprimées",
      color: 'Couleur',
      createBoard_title: 'Créer un tableau',
      createLabel_title: 'Créer une étiquette',
      createNewOneOrSelectExistingOne: 'Créez-en un nouveau ou sélectionnez <br /> un existant',
      createProject_title: 'Créer un projet',
      createTextFile_title: 'Créer un fichier texte',
      currentPassword: 'Mot de passe actuel',
      date: 'Date',
      dueDate_title: "Date d'échéance",
      deleteAttachment_title: 'Supprimer la pièce jointe',
      deleteBoard_title: 'Supprimer le tableau',
      deleteCard_title: 'Supprimer la carte',
      deleteComment_title: 'Supprimer le commentaire',
      deleteLabel_title: "Supprimer l'étiquette",
      deleteList_title: 'Supprimer la liste',
      deleteProject_title: 'Supprimer le projet',
      deleteTask_title: 'Supprimer la tâche',
      deleteUser_title: "Supprimer l'utilisateur",
      description: 'Description',
      dropFileToUpload: 'Déposer le fichier à télécharger',
      editAttachment_title: 'Modifier la pièce jointe',
      editAvatar_title: 'Modifier Avatar',
      editBoard_title: 'Modifier le tableau',
      editDueDate_title: "Modifier la date d'échéance",
      editEmail_title: "Modifier l'e-mail",
      editLabel_title: "Modifier l'étiquette",
      editPassword_title: 'Modifier le mot de passe',
      editTimer_title: 'Modifier la minuterie',
      editUsername_title: "Modifier le nom d'utilisateur",
      email: 'E-mail',
      emailAlreadyInUse: 'Email déjà utilisé',
      enterCardTitle: 'Entrer le titre de la carte ...',
      enterDescription: 'Entrez la description ...',
      enterFilename: 'Entrez le nom du fichier',
      enterListTitle: 'Entrer le titre de la liste ...',
      enterProjectTitle: 'Saisir le titre du projet',
      enterTaskDescription: 'Saisir la description de la tâche ...',
      filterByLabels_title: 'Filtrer par libellés',
      filterByMembers_title: 'Filtrer par membres',
      fromComputer_title: "Depuis l'ordinateur",
      hours: 'Les heures',
      invalidCurrentPassword: 'Mot de passe actuel invalide',
      labels: 'Étiquettes',
      list: 'Lister',
      listActions_title: 'Liste des actions',
      members: 'Membres',
      minutes: 'Minutes',
      moveCard_title: 'Déplacer la carte',
      name: 'Nom',
      newEmail: 'Nouveau courriel',
      newPassword: 'Nouveau mot de passe',
      newUsername: "Nouveau nom d'utilisateur",
      noConnectionToServer: 'Pas de connexion au serveur',
      noBoards: 'Pas de planches',
      noLists: 'Pas de listes',
      noProjects: 'Pas de projets',
      notifications: 'Notifications',
      noUnreadNotifications: 'Aucune notification non lue',
      openBoard_title: 'Open Board',
      optional_inline: 'optionnel',
      organization: 'Organisation',
      phone: 'Téléphone',
      preferences: 'Préférences',
      project: 'Projet',
      projectNotFound_title: 'Projet introuvable',
      removeMember_title: 'Supprimer le membre',
      seconds: 'Secondes',
      selectBoard: 'Sélectionner une carte',
      selectList: 'Sélectionner une liste',
      selectProject: 'Sélectionner un projet',
      settings: 'Réglages',
      subscribeToMyOwnCardsByDefault: 'Abonnez-vous à mes propres cartes par défaut',
      taskActions_title: 'Actions de tâche',
      tasks: 'Tâches',
      time: 'Temps',
      timer: 'Minuteur',
      title: 'Titre',
      userActions_title: "Actions de l'utilisateur",
      userAddedThisCardToList: '<0> {{user}} </0> <1> a ajouté cette carte à {{list}} </1>',
      userLeftNewCommentToCard: '{{user}} a laissé un nouveau commentaire {{comment}} à <2> {{card}} </2>',
      userMovedCardFromListToList: '{{user}} a déplacé <2> {{card}} </2> de {{fromList}} vers {{toList}}',
      userMovedThisCardFromListToList: '<0> {{user}} </0> <1> a déplacé cette carte de {{fromList}} vers {{toList}} </1>',
      username: "Nom d'utilisateur",
      usernameAlreadyInUse: "Nom d'utilisateur déjà utilisé",
      users: 'Utilisateurs',
      writeComment: 'Écrire un commentaire...',
    },

    action: {
      addCard: 'Ajouter une carte',
      addCard_title: 'Ajouter une carte',
      addComment: 'Ajouter un commentaire',
      addList: 'Ajouter la liste',
      addDescription: 'Ajouter une description plus détaillée',
      addTask: 'Ajouter une tâche',
      addUser: 'Ajouter un utilisateur',
      createBoard: 'Créer un tableau',
      createFile: 'Créer un fichier',
      createLabel: 'Créer une étiquette',
      createNewLabel: 'Créer une nouvelle étiquette',
      createProject: 'Créer un projet',
      delete: 'Supprimer',
      deleteAttachment: 'Supprimer la pièce jointe',
      deleteAvatar: "Supprimer l'avatar",
      deleteBoard: 'Supprimer le tableau',
      deleteCard: 'Supprimer la carte',
      deleteCard_title: 'Supprimer la carte',
      deleteComment: 'Supprimer le commentaire',
      deleteImage: "Supprimer l'image",
      deleteLabel: "Supprimer l'étiquette",
      deleteList: 'Supprimer la liste',
      deleteList_title: 'Supprimer la liste',
      deleteProject: 'Supprimer le projet',
      deleteProject_title: 'Supprimer le projet',
      deleteTask: 'Supprimer la tâche',
      deleteTask_title: 'Supprimer la tâche',
      deleteUser: "Supprimer l'utilisateur",
      edit: 'Modifier',
      editDueDate_title: "Modifier la date d'échéance",
      editDescription_title: 'Éditer la description',
      editEmail_title: "Modifier l'e-mail",
      editPassword_title: 'Modifier le mot de passe',
      editTimer_title: 'Modifier la minuterie',
      editTitle_title: 'Modifier le titre',
      editUsername_title: "Modifier le nom d'utilisateur",
      logOut_title: 'Se déconnecter',
      makeCover_title: 'Faire la jaquette',
      move: 'Déplacer',
      moveCard_title: 'Déplacer la carte',
      remove: 'Supprimer',
      removeBackground: "Supprimer l'arrière-plan",
      removeCover_title: 'Supprimer la jaquette',
      removeFromProject: 'Supprimer du projet',
      removeMember: 'Supprimer le membre',
      save: 'Sauvegarder',
      showAllAttachments: 'Afficher toutes les pièces jointes ({{hidden}} masquées)',
      showFewerAttachments: 'Afficher moins de pièces jointes',
      start: 'Début',
      stop: 'Arrêter',
      subscribe: "S'abonner",
      unsubscribe: 'Se désabonner',
      uploadNewAvatar: 'Télécharger un nouvel avatar',
      uploadNewImage: 'Télécharger une nouvelle image',
    },
  },
};
