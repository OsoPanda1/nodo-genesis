// ==================================================================
// Scripts/Zombies/ZombieAnimationController.cs
// ------------------------------------------------------------------
// Puente Animator ↔ ZombieAI: sincroniza velocidad, ataques y muerte.
// ==================================================================

using UnityEngine;

namespace RDM.YUN.Zombies
{
    public sealed class ZombieAnimationController : MonoBehaviour
    {
        [SerializeField] private Animator animator;

        private ZombieAI ai;

        private void Awake()
        {
            ai = GetComponent<ZombieAI>();
            if (animator == null) animator = GetComponent<Animator>();
        }

        private void Update()
        {
            if (animator == null || ai == null) return;

            animator.SetBool("Chasing", ai.CurrentState == ZombieAI.State.Chase);
            animator.SetBool("Attacking", ai.CurrentState == ZombieAI.State.Attack);
            animator.SetBool("Dead", ai.CurrentState == ZombieAI.State.Dead);
        }
    }
}
