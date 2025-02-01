;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TASK-NOT-FOUND (err u101))
(define-constant ERR-INVALID-STATUS (err u102))

;; Data Variables
(define-data-var task-count uint u0)

;; Maps
(define-map tasks uint {
  creator: principal,
  assignee: (optional principal),
  title: (string-utf8 64),
  description: (string-utf8 256),
  status: (string-ascii 20),
  created-at: uint,
  updated-at: uint
})

(define-map user-tasks principal (list 100 uint))

;; Public Functions
(define-public (create-task (title (string-utf8 64)) (description (string-utf8 256)))
  (let
    (
      (task-id (+ (var-get task-count) u1))
      (current-time (get-block-info? time (- block-height u1)))
    )
    (map-set tasks task-id {
      creator: tx-sender,
      assignee: none,
      title: title,
      description: description,
      status: "OPEN",
      created-at: (default-to u0 current-time),
      updated-at: (default-to u0 current-time)
    })
    (var-set task-count task-id)
    (ok task-id)
  )
)

(define-public (assign-task (task-id uint) (assignee principal))
  (let ((task (unwrap! (map-get? tasks task-id) (err ERR-TASK-NOT-FOUND))))
    (asserts! (is-eq tx-sender (get creator task)) (err ERR-NOT-AUTHORIZED))
    (ok (map-set tasks task-id (merge task {assignee: (some assignee)})))
  )
)

(define-public (update-task-status (task-id uint) (new-status (string-ascii 20)))
  (let (
    (task (unwrap! (map-get? tasks task-id) (err ERR-TASK-NOT-FOUND)))
    (current-time (get-block-info? time (- block-height u1)))
  )
    (asserts! (or
      (is-eq tx-sender (get creator task))
      (is-eq (some tx-sender) (get assignee task))
    ) (err ERR-NOT-AUTHORIZED))
    
    (ok (map-set tasks task-id (merge task {
      status: new-status,
      updated-at: (default-to u0 current-time)
    })))
  )
)

;; Read Only Functions
(define-read-only (get-task (task-id uint))
  (ok (map-get? tasks task-id))
)

(define-read-only (get-task-count)
  (ok (var-get task-count))
)
