// ==================================================================
// Scripts/Zombies/ZombieAI.cs
// ------------------------------------------------------------------
// Máquina de estados simple: Idle → Chase → Attack → Dead.
// El zombie busca al jugador dentro del rango, lo persigue y ataca.
// ==================================================================

using UnityEngine;
using UnityEngine.AI;

namespace RDM.YUN.Zombies
{
    [RequireComponent(typeof(NavMeshAgent))]
    public sealed class ZombieAI : MonoBehaviour
    {
        public enum State { Idle, Chase, Attack, Dead }

        [SerializeField] private ZombieConfig config;
        [SerializeField] private Animator animator;

        private NavMeshAgent agent;
        private Transform target;
        private float nextAttackTime;

        public State CurrentState { get; private set; } = State.Idle;

        private void Awake()
        {
            agent = GetComponent<NavMeshAgent>();
            target = GameObject.FindGameObjectWithTag("Player")?.transform;
        }

        public void Configure(ZombieConfig cfg)
        {
            config = cfg;
            agent.speed = cfg.moveSpeed;
        }

        private void Update()
        {
            if (config == null || CurrentState == State.Dead) return;

            float distance = target != null ? Vector3.Distance(transform.position, target.position) : Mathf.Infinity;

            if (target != null && distance <= config.detectionRange)
            {
                CurrentState = State.Chase;
                agent.isStopped = false;
                agent.speed = config.chaseSpeed;
                agent.SetDestination(target.position);

                if (distance <= config.attackRange && Time.time >= nextAttackTime)
                {
                    Attack();
                }
            }
            else if (CurrentState == State.Chase && distance > config.loseRange)
            {
                CurrentState = State.Idle;
                agent.isStopped = true;
            }

            if (animator != null)
            {
                animator.SetFloat("Speed", agent.velocity.magnitude);
            }
        }

        private void Attack()
        {
            CurrentState = State.Attack;
            nextAttackTime = Time.time + config.attackCooldown;
            target.GetComponent<GameCore.PlayerHealth>()?.TakeDamage(config.contactDamage);

            if (animator != null) animator.SetTrigger("Attack");

            // Vuelve a perseguir en el siguiente frame
            CurrentState = State.Chase;
        }

        public void OnDefeated()
        {
            CurrentState = State.Dead;
            agent.isStopped = true;
            if (animator != null) animator.SetTrigger("Die");
        }
    }
}
